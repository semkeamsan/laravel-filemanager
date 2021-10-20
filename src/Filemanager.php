<?php

namespace Semkeamsan\LaravelFilemanager;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
}
