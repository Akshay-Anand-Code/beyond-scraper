<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    
    public function index()
    {
        return response()->json(Article::orderBy('created_at', 'desc')->get(), 200);
    }

    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'   => 'required|string|max:255',
            'url'     => 'required|url|unique:articles,url',
            'excerpt' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $article = Article::create($request->all());
        return response()->json($article, 201);
    }

    
    public function show($id)
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }
        return response()->json($article, 200);
    }

    
    public function update(Request $request, $id)
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        $article->update($request->all());
        return response()->json($article, 200);
    }

    
    public function destroy($id)
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        $article->delete();
        return response()->json(['message' => 'Article deleted successfully'], 200);
    }
}