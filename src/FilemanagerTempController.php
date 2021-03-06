<?php

namespace Semkeamsan\LaravelFilemanager;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Semkeamsan\LaravelFilemanager\Filemanager;

class FilemanagerTempController extends Controller
{
    public function __construct()
    {

    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public $root = 'temp/';

    public function upload(Request $request)
    {
        return  Storage::putFileAs($this->root, $request->file('file'), $request->file('file')->getClientOriginalName());
    }
    public function store(Request $request)
    {

        $filemanagers = collect();
        $folder = '';
        if ($request->parent_id) {
            $filemanager =  Filemanager::find($request->parent_id);
            foreach ($filemanager->parents() as $key => $parent) {
                $folder .= $parent->slug . '/';
            }
        }

        foreach ($request->allfiles as $file) {
            $slug = Str::random(20);
                $name = $slug .'.'.pathinfo( $file['name'], PATHINFO_EXTENSION);
            if (!Filemanager::where('parent_id', $request->parent_id)->where('type', $request->type)->where('slug', $name)->count()) {
                if(!Storage::exists('public/' . $folder . $slug)){
                    Storage::move($this->root . $file['name'], 'public/' . $folder . $name);
                }
                Storage::delete($this->root . $file['name']);
                $file['slug'] = $name;
                $file['parent_id'] = $request->parent_id;
                $file['type'] = $request->type;
                $file['user_id'] = auth()->id();
                $f =   Filemanager::create($file);
                $f->path = Storage::url(rtrim($f->path(), '/'));
                $filemanagers->add($f);
            }
        }
        return $filemanagers;
    }
}
