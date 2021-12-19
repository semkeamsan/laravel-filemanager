<?php

namespace Semkeamsan\LaravelFilemanager;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Route;

class Filemanager extends Model
{
    public $parents;
    public $childrens;
    use HasFactory;
    public function __construct(array $attributes = [])
    {
        $this->parents = collect();
        $this->childrens = collect();
        $this->fillable = Schema::getColumnListing($this->getTable());
        parent::__construct($attributes);
    }
    public function path()
    {
        $path = '';
        foreach ($this->parents() as $key => $parent) {
            $path .= $parent->name . '/';
        }
        return $path;
    }
    public function parents()
    {

        if (count(func_get_args()) > 0) {
            $parent = func_get_arg(0);
        } else {
            $parent = $this;
        }

        if ($parent) {
            $this->parents->prepend($parent);
            if ($parent->parent) {
                $this->parents($parent->parent);
            }
        }
        return $this->parents;
    }
    public function childrens()
    {
        if (count(func_get_args()) > 0) {
            $child = func_get_arg(0);
        } else {
            $child = $this;
        }
        if ($child->children->count()) {
            foreach ($child->children as $key => $inchild) {
                $this->childrens->add($inchild);
                $this->childrens($inchild);
            }
        }
        return $this->childrens;
    }
    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id')->where('type', 'folder');
    }
    public function children()
    {
        return $this->hasMany(self::class, 'parent_id')->where('type', 'folder');
    }

    public function files()
    {
        return $this->hasMany(self::class, 'parent_id')->where('type', 'file');
    }


    public static function routes()
    {
        dd(config());
            Route::get(config('semkeamsan.laravel-filemanager.route.url'), '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@index');
            Route::get(config('semkeamsan.laravel-filemanager.route.url') . '/demo', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@demo');
            Route::prefix('api')->group(function () {
                Route::prefix(config('semkeamsan.laravel-filemanager.route.url'))->group(function () {
                    Route::get('/', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@all');
                    Route::post('/', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@store');
                    Route::post('/upload', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@upload');
                    Route::get('/folders', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@folders');
                    Route::get('/folder/{id}', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@folder');
                    Route::put('/{id}', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@update');
                    Route::delete('/{id}', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerController@destroy');

                    //Temp
                    Route::post('temp/upload', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerTempController@upload');
                    Route::post('temp/store', '\\Semkeamsan\\LaravelFilemanager\\FilemanagerTempController@store');
                });
            });

    }
}
