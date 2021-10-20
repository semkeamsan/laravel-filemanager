<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Styles -->
    <link href="{{ asset('vendor/semkeamsan/laravel-filemanager/bootstrap/css/bootstrap.min.css') }}"
        rel="stylesheet">
    <link href="{{ asset('vendor/semkeamsan/laravel-filemanager/filemanager/filemanager.css') }}" rel="stylesheet">
    <!-- Fonts -->
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
</head>

<body class="bg-white">
    <div class="container-fluid">
        <div class="row my-3">
            <div class="col-auto">
                <button class="btn btn-primary mb-3" id="one" data-target-input="#input" data-target-image="#img">
                    One Image
                </button>

            </div>
            <div class="col">
                <input class="form-control" id="input">
                <img class="border" width="150px" height="150px" src="" id="img" style="object-fit: contain">
            </div>
        </div>
        <div class="row my-3">
            <div class="col-auto">
                <button class="btn btn-primary mb-3" id="multiple" data-target="#group">
                    Multiple Image
                </button>

            </div>
            <div class="col border">
                <div id="group">

                </div>
            </div>
        </div>
        <div class="row my-3">
            <div class="col-auto">
                <button class="btn btn-primary mb-3" id="custom" data-target="#custom-group">
                    Custom
                </button>

            </div>
            <div class="col border">
                <div id="custom-group">

                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <h2 class="mt-4">CKEditor</h2>
                <textarea name="ce" class="form-control"></textarea>
            </div>
        </div>
    </div>



    <script src="{{ asset('vendor/semkeamsan/laravel-filemanager/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('vendor/semkeamsan/laravel-filemanager/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('vendor/semkeamsan/laravel-filemanager/filemanager/filemanager.js') }}"></script>
    @if (app()->getLocale() != 'en')
        <script src="{{ asset('vendor/semkeamsan/laravel-filemanager/filemanager/locales/' . app()->getLocale() . '.js') }}">
        </script>
    @endif

    <script>
        var _token = $('meta[name="csrf-token"]').attr("content");
        $(`#one`).filemanager({
            url: `{{ env('FILEMANAGER_URL', 'filemanager') }}`,
            _token: _token,
            multiple: false,
        });

        $(`#multiple`).filemanager({
            url: `{{ env('FILEMANAGER_URL', 'filemanager') }}`,
            _token: _token,
            multiple: true,
            input_name: 'images[]',

        });
        $(`#custom`).filemanager({
            url: `{{ env('FILEMANAGER_URL', 'filemanager') }}`,
            _token: _token,
            multiple: true,
            query: {
                extension: 'image'
            },
            template: data => {
                var $t = $(`<div class="border m-1" style="width:120px;height:120px;float:left;position: relative;">
                <i id="del" class="fa fa-times fa-z position-absolute text-danger p-1" style=" z-index: 1; right: 0;"></i>
                <input type="hidden" class="form-control" name="files[]" value="${data.path}">
                <img width="100%" height="100%" src="${data.path}" style="object-fit: contain">
                </div>`);
                $t.find('#del').click(() => {
                    $t.remove();
                });
                var target = $(`#custom`).data('target');
                $(target).append($t);
            }
        });
    </script>

   <!-- CKEditor init -->
   <script src="//cdnjs.cloudflare.com/ajax/libs/ckeditor/4.5.11/ckeditor.js"></script>
   <script src="//cdnjs.cloudflare.com/ajax/libs/ckeditor/4.5.11/adapters/jquery.js"></script>
    <script>
        $('textarea[name=ce]').ckeditor({
            height: 100,
            filebrowserImageBrowseUrl: `/{{ env('FILEMANAGER_URL', 'filemanager') }}`,
        });
    </script>

</body>

</html>
