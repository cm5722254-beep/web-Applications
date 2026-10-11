<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGenreController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => GenreResource::collection(Genre::orderBy('name_en')->get())]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'unique:genres,name_en', 'max:100'],
            'name_km' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'icon'   => ['nullable', 'string', 'max:50'],
        ]);

        $genre = Genre::create($validated);
        $this->audit->log('genre.created', $request->user(), $genre, null, $request);

        return response()->json(['data' => new GenreResource($genre)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $genre = Genre::findOrFail($id);

        $validated = $request->validate([
            'name_en'     => ['sometimes', 'string', 'max:100', 'unique:genres,name_en,' . $id],
            'name_km'     => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'icon'        => ['nullable', 'string', 'max:50'],
            'is_active'   => ['boolean'],
        ]);

        $genre->update($validated);
        $this->audit->log('genre.updated', $request->user(), $genre, null, $request);

        return response()->json(['data' => new GenreResource($genre)]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $genre = Genre::findOrFail($id);
        $genre->delete();
        $this->audit->log('genre.deleted', $request->user(), $genre, $genre->toArray(), $request);

        return response()->json(['message' => 'Genre deleted.']);
    }
}
