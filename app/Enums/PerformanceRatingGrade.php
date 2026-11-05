<?php

declare(strict_types=1);

namespace App\Enums;

enum PerformanceRatingGrade: string
{
    case A = 'A';
    case B = 'B';
    case C = 'C';
    case D = 'D';

    public function label(): string
    {
        return match ($this) {
            self::A => 'Grade A - Istimewa (Exceeds Expectations)',
            self::B => 'Grade B - Baik (Meets Expectations)',
            self::C => 'Grade C - Cukup (Needs Improvement)',
            self::D => 'Grade D - Kurang (Unsatisfactory)',
        };
    }

    public static function fromScore(float $score): self
    {
        return match (true) {
            $score >= 90.0 => self::A,
            $score >= 75.0 => self::B,
            $score >= 60.0 => self::C,
            default => self::D,
        };
    }
}

