<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * This is where you put authorization logic.
     * Return true if the user can make this request, false otherwise.
     */
    public function authorize(): bool
    {
        // Only authenticated users can create teams
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                // This ensures the team name is unique for this user
                Rule::unique('teams')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
        ];
    }

    /**
     * Custom error messages for validation failures.
     * This improves user experience with friendly messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'A team name is required.',
            'name.unique' => 'You already have a team with this name.',
            'name.max' => 'Team name cannot exceed 255 characters.',
        ];
    }
}
