<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubtitleTrackResource;
use App\Models\Episode;
use App\Models\SubtitleTrack;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminSubtitleController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status'     => ['nullable', 'in:pending_review,approved,rejected'],
            'episode_id' => ['nullable', 'integer'],
        ]);

        $query = SubtitleTrack::with(['episode.season.anime', 'uploader', 'reviewer'])->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->episode_id) {
            $query->where('episode_id', $request->episode_id);
        }

        $tracks = $query->paginate(20);

        return response()->json([
            'data' => SubtitleTrackResource::collection($tracks),
            'meta' => ['current_page' => $tracks->currentPage(), 'total' => $tracks->total()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $track = SubtitleTrack::with(['episode', 'uploader', 'reviewer'])->findOrFail($id);

        return response()->json(['data' => new SubtitleTrackResource($track)]);
    }

    /**
     * Upload a subtitle file.
     * Only accepts .vtt and .srt files up to the configured size limit.
     */
    public function store(Request $request): JsonResponse
    {
        $maxKb = config('app.subtitle_max_size_kb', 2048);

        $validated = $request->validate([
            'episode_id'     => ['required', 'integer', 'exists:episodes,id'],
            'language_code'  => ['required', 'string', 'max:10'],
            'language_name_en' => ['required', 'string', 'max:100'],
            'file'           => [
                'required',
                'file',
                'mimes:vtt,srt,txt',
                'max:' . $maxKb,
            ],
        ]);

        $file      = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        // Additional content validation
        $contents = file_get_contents($file->getRealPath());
        if ($extension === 'vtt' && ! str_starts_with(ltrim($contents), 'WEBVTT')) {
            return response()->json(['message' => 'Invalid VTT file: must begin with WEBVTT header.'], 422);
        }

        // Sanitize filename and store privately
        $filename = Str::random(40) . '.' . $extension;
        $path     = 'subtitles/' . date('Y/m') . '/' . $filename;

        Storage::disk('local')->put($path, $contents);

        $track = SubtitleTrack::create([
            'episode_id'       => $validated['episode_id'],
            'language_code'    => $validated['language_code'],
            'language_name_en' => $validated['language_name_en'],
            'format'           => $extension,
            'file_path'        => $path,
            'file_size_bytes'  => strlen($contents),
            'checksum'         => hash('sha256', $contents),
            'status'           => 'pending_review',
            'uploaded_by'      => $request->user()->id,
        ]);

        $this->audit->log('subtitle.uploaded', $request->user(), $track, null, $request);

        return response()->json(['data' => new SubtitleTrackResource($track)], 201);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $request->validate(['notes' => ['nullable', 'string', 'max:1000']]);

        $track = SubtitleTrack::findOrFail($id);

        if (! $request->user()->hasAnyRole(['super_admin', 'content_manager', 'subtitle_editor'])) {
            return response()->json(['message' => 'Insufficient permissions.'], 403);
        }

        $track->update([
            'status'       => 'approved',
            'reviewed_by'  => $request->user()->id,
            'reviewed_at'  => now(),
            'review_notes' => $request->notes,
        ]);

        $this->audit->log('subtitle.approved', $request->user(), $track, null, $request);

        return response()->json(['message' => 'Subtitle approved.', 'data' => new SubtitleTrackResource($track)]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['notes' => ['required', 'string', 'max:1000']]);

        $track = SubtitleTrack::findOrFail($id);

        $track->update([
            'status'       => 'rejected',
            'reviewed_by'  => $request->user()->id,
            'reviewed_at'  => now(),
            'review_notes' => $request->notes,
        ]);

        $this->audit->log('subtitle.rejected', $request->user(), $track, null, $request);

        return response()->json(['message' => 'Subtitle rejected.']);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $track = SubtitleTrack::findOrFail($id);

        if (! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Only super admins can delete subtitle files.'], 403);
        }

        // Remove file from storage
        Storage::disk('local')->delete($track->file_path);

        $this->audit->log('subtitle.deleted', $request->user(), $track, $track->toArray(), $request);

        $track->delete();

        return response()->json(['message' => 'Subtitle deleted.']);
    }
}
