<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diagnostic extends Model
{
    use HasFactory;

   protected $fillable = [
        'user_id', // Ajouté
        'prenom', 'age', 'email', 'type_peau', 'problematiques', 'preferences', 'budget',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    // 👇 C'EST CETTE PARTIE QUI EVITE L'ERREUR 500
    protected $casts = [
        'problematiques' => 'array',
        'preferences'    => 'array',
        'age'            => 'integer',
    ];
}