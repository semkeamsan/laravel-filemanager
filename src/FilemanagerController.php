<?php

namespace Semkeamsan\LaravelFilemanager;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class FilemanagerController extends Controller
{
    public function __construct()
    {

    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public $root = 'public/';

    public function index(Request $request)
    {
        return view('semkeamsan/laravel-filemanager::index');
    }
    public function demo()
    {
        return view('semkeamsan/laravel-filemanager::demo');
    }
    public function all()
    {



        return Filemanager::withCount(['files'])->with(['parent'])->whereNull('parent_id')->where(function ($table) {

            if(config('semkeamsan.laravel-filemanager.roles') && !in_array(request()->user()->role_id,config('semkeamsan.laravel-filemanager.roles',[])) ){
                $table->where('user_id',request()->user()->id);
            }

            $table->when(request('extension'), function ($t) {
                $t->where('extension', request('extension'));
            });
        })->latest('id')->get()->map(function ($row) {
            $row->path =  Storage::url(rtrim($row->path(), '/'));
            if ($row->type == 'folder') {
                $row->size =  $row->files->sum('size');
            }
            return $row;
        });
    }

    public function folders()
    {
        return collect([
            [
                'id' => '',
                'name' => trans('semkeamsan/laravel-filemanager::langauages.All'),
                'children' =>  Filemanager::where('type', 'folder')->whereNull('parent_id')->get()->map(function ($row) {
                    if(config('semkeamsan.laravel-filemanager.roles') && !in_array(request()->user()->role_id,config('semkeamsan.laravel-filemanager.roles',[])) ){
                        $row->where('user_id',request()->user()->id);
                    }

                    $row->children = $row->childrens()->map(function ($children) {
                        $children->path = $children->path();
                    });
                    $row->path =  Storage::url(rtrim($row->path(), '/'));
                    return $row;
                }),
            ]
        ]);
    }
    public function folder($id)
    {
        return  Filemanager::withCount(['files'])->whereHas('parent', function ($parent) use ($id) {
            $parent->where('id', $id);
        })->where(function ($table) {
            if(config('semkeamsan.laravel-filemanager.roles') && !in_array(request()->user()->role_id,config('semkeamsan.laravel-filemanager.roles',[])) ){
                $table->where('user_id',request()->user()->id);
            }


            $table->when(request('extension'), function ($t) {
                $t->where('extension', request('extension'));
            });
        })->get()->map(function ($row) {
            $row->path =  Storage::url(rtrim($row->path(), '/'));
            if ($row->type == 'folder') {
                $row->size =  $row->files->sum('size');
            }
            return $row;
        });
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

        request()->merge(['user_id' => auth()->id() ]);

        $folder = '';
        $slug = Str::random(20);
        $name = $request->name;
        $parent = null;
        if ($request->parent_id) {
            $filemanager = $parent =  Filemanager::with(['parent'])->find($request->parent_id);
            $folder = $filemanager->path();
            if ($filemanager->children->where('type', $request->type)->where('name', $name)->count()) {

                return;
            }
        }
        if ($request->type == 'folder') {
            Storage::makeDirectory($this->root . $folder . $name);
        } elseif ($request->type == 'file') {
            Storage::put($this->root . $folder . $name, '');
        }

        $request->merge([
            'slug' => $slug,
            'extension' => request('extension', $this->types($name)),
        ]);
        if ($request->parent_id) {
            if (Filemanager::where('parent_id', $request->parent_id)->where('type', $request->type)->where('name', $name)->count()) {
                return;
            }
        } elseif (Filemanager::whereNull('parent_id')->where('type', $request->type)->where('name', $name)->count()) {
            return;
        }
        $filemanager = Filemanager::create($request->all());
        $filemanager->children =  collect();
        $filemanager->parent = $parent;
        $filemanager->files_count =  0;
        return $filemanager;
    }
    public function upload(Request $request)
    {


        $folder = '';
        if ($request->parent_id) {
            $filemanager =  Filemanager::find($request->parent_id);
            foreach ($filemanager->parents() as $key => $parent) {
                $folder .= $parent->name . '/';
            }
        }
        $filemanagers = collect();
        foreach ($request->file('files') as $key => $file) {
            $slug = Str::random(20);
            $name = $file->getClientOriginalName();
            if (!Filemanager::where('parent_id', $request->parent_id)->where('type', $request->type)->where('name', $name)->count()) {
                Storage::putFileAs($this->root . $folder, $file, $name);
                $f =   Filemanager::create([
                    'name' => $name,
                    'slug' => $slug,
                    'parent_id' => $request->parent_id,
                    'type'      => $request->type,
                    'extension' => $this->types($name),
                    'mime' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'user_id' => auth()->id()
                ]);
                $f->path = Storage::url(rtrim($f->path(), '/'));
                $filemanagers->add($f);
            }
        }
        return $filemanagers;
    }
    public function types($filename)
    {
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        $ext = Str::lower($ext);
        $types = [
            'jpg' => 'image',
            'jpeg' => 'image',
            'png' => 'image',
            'doc'  => 'document',
            'docx'  => 'document',
            'dmg'  => 'apple',
            'dmg'  => 'apple',
            'txt'   => 'text',
            'log'   => 'text',
            'exe' => 'application',
            'msi' => 'application',
            'dll' => 'application',
            'sys' => 'application',
            'bat' => 'application',
            'html' => 'web',
            'htm' => 'web',
            'xml' => 'web',
            'pdf' => 'pdf',
            'ppt' => 'presentation',
            'psd' => 'psd',
            'wav' => 'audio',
            'mp3' => 'audio',
            'xls' => 'table',
            'xlsx' => 'table',
            'zip' => 'archive',
            'rar' => 'archive',
            'iso' => 'archive',
            'mp4' => 'video',
            'mov' => 'video',
            'flv' => 'video',
        ];

        return @$types[$ext] ?? 'other';
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {

        $filemanager = Filemanager::find($id);
        $name = $request->name;
        $folder = '';
        if ($filemanager->parent_id) {
            foreach ($filemanager->parents() as $key => $parent) {
                if ($parent->id != $filemanager->id) {
                    $folder .= $parent->name . '/';
                }
            }
        }
        if ($filemanager->type == 'file') {
            $request->merge([
                'extension' => request('extension', $this->types($name)),
            ]);
        }
        Storage::rename($this->root . $folder . $filemanager->name, $this->root . $folder  . $name);
        $filemanager->update($request->all());
        $filemanager->path = Storage::url(rtrim($folder . $name, '/'));

        if ($filemanager->type == 'folder') {
            $filemanager->size =  $filemanager->files->sum('size');
            $filemanager->files_count =  $filemanager->files->count();
        }
        return $filemanager;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($ids)
    {
        $deleted = collect();
        foreach (explode(',', $ids) as $key => $id) {
            $filemanager = Filemanager::find($id);
            if ($filemanager) {
                $folder = '';
                if ($filemanager->parent_id) {
                    foreach ($filemanager->parents() as $key => $parent) {
                        if ($parent->id != $filemanager->id) {
                            $folder .= $parent->name . '/';
                        }
                    }
                }
                if ($filemanager->type == 'folder') {
                    Storage::deleteDirectory($this->root . $folder . $filemanager->name);

                    foreach ($filemanager->childrens() as $key => $child) {
                        foreach ($child->files as $key => $f) {
                            $f->delete();
                        }
                        $child->delete();
                    }
                    foreach ($filemanager->files as $key => $child) {
                        $child->delete();
                    }
                }
                Storage::delete($this->root . $folder . $filemanager->name);
                $deleted->add($filemanager);
                $filemanager->delete();
            }
        }
        return $deleted;
    }
}
