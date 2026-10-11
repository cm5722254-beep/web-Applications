<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\JsonResponse;

class GenreController extends Controller
{
    public function index(): JsonResponse
    {
        $genres = Genre::where('is_active', true)->orderBy('name_en')->get();

        return response()->json(['data' => GenreResource::collection($genres)]);
    }

    public function show(string $slug): JsonResponse
    {
        $genre = Genre::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return response()->json(['data' => new GenreResource($genre)]);
    }
}
