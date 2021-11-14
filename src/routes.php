<?php

use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get(env('FILEMANAGER_URL', 'filemanager'), 'Semkeamsan\LaravelFilemanager\FilemanagerController@index');
Route::get(env('FILEMANAGER_URL', 'filemanager') . '/demo', 'Semkeamsan\LaravelFilemanager\FilemanagerController@demo');
Route::prefix('api')->group(function () {
    Route::prefix(env('FILEMANAGER_URL', 'filemanager'))->group(function () {
        Route::get('/', 'Semkeamsan\LaravelFilemanager\FilemanagerController@all');
        Route::post('/', 'Semkeamsan\LaravelFilemanager\FilemanagerController@store');
        Route::post('/upload', 'Semkeamsan\LaravelFilemanager\FilemanagerController@upload');
        Route::get('/folders', 'Semkeamsan\LaravelFilemanager\FilemanagerController@folders');
        Route::get('/folder/{id}', 'Semkeamsan\LaravelFilemanager\FilemanagerController@folder');
        Route::put('/{id}', 'Semkeamsan\LaravelFilemanager\FilemanagerController@update');
        Route::delete('/{id}', 'Semkeamsan\LaravelFilemanager\FilemanagerController@destroy');

        //Temp
        Route::post('temp/upload', 'Semkeamsan\LaravelFilemanager\FilemanagerTempController@upload');
        Route::post('temp/store', 'Semkeamsan\LaravelFilemanager\FilemanagerTempController@store');
    });
});
