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
        <div id="filemanager"></div>
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
        var filemanager = new Filemanager($(`#filemanager`), {
            url: 'filemanager',
            _token: _token,
        });
        filemanager.init();
    </script>
</body>

</html>
