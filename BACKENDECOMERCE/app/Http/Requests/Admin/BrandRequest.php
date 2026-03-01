<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;

class BrandRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $brandId = $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,&\+\(\)À-ÿ]+$/u',
                Rule::unique('brands', 'name')->ignore($brandId),
            ],
            'description' => [
                'required',
                'string',
                'min:10',
                'max:300',
                'regex:/^(?![0-9]+$)[\pL\pN\s\-\'\.,!?;:&\+\(\)À-ÿ]+$/u'
            ],
        ];
    }
}
