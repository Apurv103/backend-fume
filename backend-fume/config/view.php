<?php

return [

    'paths' => [
        resource_path('views'),
    ],

    // Use storage_path directly so Laravel can create the directory if missing
    'compiled' => env('VIEW_COMPILED_PATH', storage_path('framework/views')),

];