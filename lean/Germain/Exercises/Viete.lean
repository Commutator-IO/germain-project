import Mathlib

/-!
# The François Viète chapter of the exercise book

`exercises/exercices.fr.tex`, section « François Viète (1540--1603) ». One group of theorems per
exercise; each docstring names the exercise and the question.

* « Des racines aux coefficients : la syncrise » (nal-1644, views 48–50, 139–141):
  `syncrise_quadratic`, `syncrise_cubic`, `syncrise_cubic_factor`, `syncrise_example`,
  `syncrise_quartic`, `syncrise_quartic_copy`, `syncrise_quintic`.
* « La paraplérose climactique d'une quartique » (nal-1644, views 109–117):
  `paraplerose_square`, `paraplerose_resolvent`, `paraplerose_unique_root`,
  `paraplerose_example`, `paraplerose_factorisation`, `paraplerose_resolvent_roots`,
  `paraplerose_second_formula`, `paraplerose_theorem_four`.

Not formalised: the irreducible case by two right triangles (trigonometry of the construction).
-/

namespace Germain.Exercises.Viete

/-! ## « Des racines aux coefficients : la syncrise » -/

/-- **La syncrise**, question 1. Two roots `x ≠ y` of `Bt − t² = Z` give `B = x + y` and `Z = xy`;
for `10` and `2`, `12t − t² = 20`. -/
theorem syncrise_quadratic (B Z x y : ℝ) (hxy : x ≠ y) (hx : B * x - x ^ 2 = Z)
    (hy : B * y - y ^ 2 = Z) : B = x + y ∧ Z = x * y := by
  have h : (x - y) * (B - (x + y)) = 0 := by linear_combination hx - hy
  have hB : B = x + y := by
    have := (mul_eq_zero.1 h).resolve_left (sub_ne_zero.2 hxy); linarith
  exact ⟨hB, by rw [← hx, hB]; ring⟩

/-- **La syncrise**, question 2. Two roots `x ≠ y` of `Bt − t³ = Z` give `B = x² + xy + y²` and
`Z = xy(x + y)`. -/
theorem syncrise_cubic (B Z x y : ℝ) (hxy : x ≠ y) (hx : B * x - x ^ 3 = Z)
    (hy : B * y - y ^ 3 = Z) : B = x ^ 2 + x * y + y ^ 2 ∧ Z = x * y * (x + y) := by
  have h : (x - y) * (B - (x ^ 2 + x * y + y ^ 2)) = 0 := by linear_combination hx - hy
  have hB : B = x ^ 2 + x * y + y ^ 2 := by
    have := (mul_eq_zero.1 h).resolve_left (sub_ne_zero.2 hxy); linarith
  exact ⟨hB, by rw [← hx, hB]; ring⟩

/-- **La syncrise**, question 2. `(t² − (x+y)t + xy)(t + x + y) = t³ − Bt + Z`: the third root of
`t³ − Bt + Z = 0` is `−(x + y)`. -/
theorem syncrise_cubic_factor (x y t : ℝ) :
    (t ^ 2 - (x + y) * t + x * y) * (t + x + y) =
      t ^ 3 - (x ^ 2 + x * y + y ^ 2) * t + x * y * (x + y) := by
  ring

/-- **La syncrise**, questions 1 and 2, the leaf's examples. `12N − 1Q = 20` has roots `10` and
`2`; `124N − 1C = 240` has roots `10` and `2`, and `t³ − 124t + 240 = (t − 2)(t − 10)(t + 12)`. -/
theorem syncrise_example (t : ℝ) :
    (12 * 10 - 10 ^ 2 = (20 : ℝ) ∧ 12 * 2 - 2 ^ 2 = (20 : ℝ)) ∧
    ((10 : ℝ) ^ 2 + 10 * 2 + 2 ^ 2 = 124 ∧ (10 : ℝ) * 2 * (10 + 2) = 240) ∧
    t ^ 3 - 124 * t + 240 = (t - 2) * (t - 10) * (t + 12) := by
  refine ⟨⟨by norm_num, by norm_num⟩, ⟨by norm_num, by norm_num⟩, by ring⟩

/-- **La syncrise**, question 3. `(x−1)(x−2)(x−3)(x−4) = x⁴ − 10x³ + 35x² − 50x + 24`, and
`50 = 6 + 8 + 12 + 24`. -/
theorem syncrise_quartic (x : ℝ) :
    (x - 1) * (x - 2) * (x - 3) * (x - 4) = x ^ 4 - 10 * x ^ 3 + 35 * x ^ 2 - 50 * x + 24 ∧
    (50 : ℝ) = 2 * 3 * 4 + 1 * 3 * 4 + 1 * 2 * 4 + 1 * 2 * 3 := by
  constructor
  · ring
  · norm_num

/-- **La syncrise**, question 3. As written, with `16` for `10`, `50N − 35Q + 16C − 1QQ` takes the
values `30, 72, 186, 408` at `1, 2, 3, 4`: none is `24`, and `1` is not a root. -/
theorem syncrise_quartic_copy :
    let f : ℝ → ℝ := fun x => 50 * x - 35 * x ^ 2 + 16 * x ^ 3 - x ^ 4
    f 1 = 30 ∧ f 2 = 72 ∧ f 3 = 186 ∧ f 4 = 408 := by
  norm_num

/-- **La syncrise**, question 4. With `w = x² − 6x`, `(x−1)(x−5) = w + 5`, `(x−2)(x−4) = w + 8`;
the quintic is `x⁵ − 15x⁴ + 85x³ − 225x² + 274x − 120`, and
`274 = 120 (1 + 1/2 + 1/3 + 1/4 + 1/5)`. -/
theorem syncrise_quintic (x : ℝ) :
    (x - 1) * (x - 5) = (x ^ 2 - 6 * x) + 5 ∧ (x - 2) * (x - 4) = (x ^ 2 - 6 * x) + 8 ∧
    (x - 1) * (x - 2) * (x - 3) * (x - 4) * (x - 5) =
      x ^ 5 - 15 * x ^ 4 + 85 * x ^ 3 - 225 * x ^ 2 + 274 * x - 120 ∧
    (274 : ℝ) = 120 * (1 + 1 / 2 + 1 / 3 + 1 / 4 + 1 / 5) := by
  refine ⟨by ring, by ring, by ring, by norm_num⟩

/-! ## « La paraplérose climactique d'une quartique » -/

/-- **La paraplérose**, question 1. Adding to both sides of `x⁴ + 2Gx² = Z − Bx` what makes the
first the square of `x² + G + y²/2`. -/
theorem paraplerose_square (G B Z x y : ℝ) (h : x ^ 4 + 2 * G * x ^ 2 = Z - B * x) :
    (x ^ 2 + G + y ^ 2 / 2) ^ 2 = y ^ 2 * x ^ 2 - B * x + Z + G ^ 2 + G * y ^ 2 + y ^ 4 / 4 := by
  linear_combination h

/-- **La paraplérose**, question 1. The right side is, for every `x`, the square of `B/(2y) − yx`
exactly when `u = y²` satisfies the resolvent `u³ + 4Gu² + (4Z + 4G²)u = B²`. -/
theorem paraplerose_resolvent (G B Z y : ℝ) (hy : y ≠ 0) :
    (∀ x : ℝ, y ^ 2 * x ^ 2 - B * x + Z + G ^ 2 + G * y ^ 2 + y ^ 4 / 4 = (B / (2 * y) - y * x) ^ 2) ↔
      (y ^ 2) ^ 3 + 4 * G * (y ^ 2) ^ 2 + (4 * Z + 4 * G ^ 2) * y ^ 2 = B ^ 2 := by
  have hy2 : (4 * y ^ 2 : ℝ) ≠ 0 := by positivity
  constructor
  · intro h
    have h0 := h 0
    have key : B ^ 2 = 4 * y ^ 2 * (B / (2 * y)) ^ 2 := by field_simp; ring
    linear_combination (4 * y ^ 2) * h0 - key
  · intro h x
    field_simp
    linear_combination 4 * h

/-- **La paraplérose**, question 1. For `B ≠ 0` and `G, Z ≥ 0`, the resolvent has exactly one
positive root. -/
theorem paraplerose_unique_root (G B Z : ℝ) (hG : 0 ≤ G) (hZ : 0 ≤ Z) (hB : B ≠ 0) :
    ∃! u : ℝ, 0 < u ∧ u ^ 3 + 4 * G * u ^ 2 + (4 * Z + 4 * G ^ 2) * u = B ^ 2 := by
  set R : ℝ → ℝ := fun u => u ^ 3 + 4 * G * u ^ 2 + (4 * Z + 4 * G ^ 2) * u with hR
  have hB2 : 0 < B ^ 2 := by positivity
  have hmono : StrictMonoOn R (Set.Ici 0) := by
    intro u hu v hv huv
    simp only [Set.mem_Ici] at hu hv
    simp only [hR]
    have h1 : u ^ 3 < v ^ 3 := by gcongr
    have h2 : u ^ 2 ≤ v ^ 2 := by gcongr
    nlinarith [mul_le_mul_of_nonneg_left h2 hG, mul_le_mul_of_nonneg_left huv.le
      (show 0 ≤ 4 * Z + 4 * G ^ 2 by positivity)]
  -- existence: `R 0 = 0 < B²` and `R (1 + B²) ≥ 1 + B²`
  obtain ⟨u, ⟨hu0, hu1⟩, hu⟩ : B ^ 2 ∈ R '' Set.Icc 0 (1 + B ^ 2) := by
    apply intermediate_value_Icc (by positivity) (by fun_prop)
    constructor
    · simp [hR]; positivity
    · simp only [hR]
      have hw : (1 : ℝ) ≤ 1 + B ^ 2 := by nlinarith [sq_nonneg B]
      have h1 : (1 + B ^ 2) ≤ (1 + B ^ 2) ^ 3 := by
        nlinarith [mul_nonneg (mul_nonneg (show (0 : ℝ) ≤ 1 + B ^ 2 by linarith)
          (show (0 : ℝ) ≤ 1 + B ^ 2 - 1 by linarith)) (show (0 : ℝ) ≤ 1 + B ^ 2 + 1 by linarith)]
      nlinarith [mul_nonneg hG (sq_nonneg (1 + B ^ 2)),
        mul_nonneg (show 0 ≤ 4 * Z + 4 * G ^ 2 by positivity) (show 0 ≤ 1 + B ^ 2 by positivity)]
  have hu_pos : 0 < u := by
    rcases hu0.lt_or_eq with h | h
    · exact h
    · subst h; simp [hR] at hu; linarith
  refine ⟨u, ⟨hu_pos, hu⟩, fun v ⟨hv, hv'⟩ => ?_⟩
  exact hmono.injOn (Set.mem_Ici.2 hv.le) (Set.mem_Ici.2 hu_pos.le) (hv'.trans hu.symm)

/-- **La paraplérose**, question 2, the example of theorem I (view 113): `x⁴ + 6x² + 880x = 1800`.
The resolvent is `u³ + 12u² + 7236u = 774400`, `u = 64` satisfies it, `D = 8`, and
`x⁴ + 6x² + 880x − 1800 = (x² + 8x − 20)(x² − 8x + 90)`: roots `2`, `−10`, `4 ± i√74`. -/
theorem paraplerose_example (x : ℂ) :
    (4 * 1800 + 4 * 3 ^ 2 = (7236 : ℝ) ∧ (880 : ℝ) ^ 2 = 774400) ∧
    (64 : ℝ) ^ 3 + 12 * 64 ^ 2 + 7236 * 64 = 774400 ∧
    (880 : ℝ) / (2 * 8) - 8 ^ 2 / 2 - 3 = 20 ∧
    x ^ 4 + 6 * x ^ 2 + 880 * x - 1800 = (x ^ 2 + 8 * x - 20) * (x ^ 2 - 8 * x + 90) ∧
    (x ^ 4 + 6 * x ^ 2 + 880 * x - 1800 = 0 ↔
      x = 2 ∨ x = -10 ∨ x = 4 + Real.sqrt 74 * Complex.I ∨ x = 4 - Real.sqrt 74 * Complex.I) := by
  have hs : ((Real.sqrt 74 : ℂ)) ^ 2 = 74 := by
    rw [← Complex.ofReal_pow, Real.sq_sqrt (by norm_num)]; norm_num
  have hf : x ^ 4 + 6 * x ^ 2 + 880 * x - 1800 =
      (x - 2) * (x + 10) * (x - (4 + Real.sqrt 74 * Complex.I)) *
        (x - (4 - Real.sqrt 74 * Complex.I)) := by
    linear_combination (x - 2) * (x + 10) * (-hs + (Real.sqrt 74 : ℂ) ^ 2 * Complex.I_sq)
  refine ⟨⟨by norm_num, by norm_num⟩, by norm_num, by norm_num, by ring, ?_⟩
  rw [hf]
  simp only [mul_eq_zero, sub_eq_zero, add_eq_zero_iff_eq_neg, or_assoc]

/-- **La paraplérose**, question 3. A factorisation `(x² + Dx + p)(x² − Dx + q)` of
`x⁴ + 2Gx² + Bx − Z` with `D ≠ 0` makes `D²` a root of the same resolvent, and
`p = G + D²/2 − B/(2D)`. -/
theorem paraplerose_factorisation (G B Z D p q : ℝ) (hD : D ≠ 0)
    (h1 : p + q - D ^ 2 = 2 * G) (h2 : D * (q - p) = B) (h3 : p * q = -Z) :
    (D ^ 2) ^ 3 + 4 * G * (D ^ 2) ^ 2 + (4 * Z + 4 * G ^ 2) * D ^ 2 = B ^ 2 ∧
    p = G + D ^ 2 / 2 - B / (2 * D) := by
  constructor
  · -- `(p + q)² − (q − p)² = 4pq`, times `D²`
    rw [← h2]
    linear_combination (D ^ 2) * (-(p + q + D ^ 2 + 2 * G) * h1 + 4 * h3)
  · field_simp; linear_combination D * h1 - h2

/-- The coefficients of `(x² + Dx + p)(x² − Dx + q)`, which gives the three relations above. -/
theorem paraplerose_product (D p q x : ℝ) :
    (x ^ 2 + D * x + p) * (x ^ 2 - D * x + q) =
      x ^ 4 + (p + q - D ^ 2) * x ^ 2 + D * (q - p) * x + p * q := by
  ring

/-- **La paraplérose**, question 3. If `r₁ + r₂ + r₃ + r₄ = 0`, then `(x − r₁)(x − r₂)` and
`(x − r₃)(x − r₄)` are of the form `x² + Dx + p`, `x² − Dx + q` with `D = −(r₁ + r₂)`: so
`(r₁ + r₂)²` is `D²`. For the example the resolvent is `(u − 64)(u² + 76u + 12100)`, with roots
`64` and `(6 ± i√74)² = −38 ± 12i√74`. -/
theorem paraplerose_resolvent_roots (u : ℂ) :
    u ^ 3 + 12 * u ^ 2 + 7236 * u - 774400 = (u - 64) * (u ^ 2 + 76 * u + 12100) ∧
    (6 + Real.sqrt 74 * Complex.I) ^ 2 = -38 + 12 * Real.sqrt 74 * Complex.I ∧
    (-38 + 12 * Real.sqrt 74 * Complex.I) ^ 2 + 76 * (-38 + 12 * Real.sqrt 74 * Complex.I) + 12100 = 0 := by
  have hs : ((Real.sqrt 74 : ℂ)) ^ 2 = 74 := by
    rw [← Complex.ofReal_pow, Real.sq_sqrt (by norm_num)]; norm_num
  refine ⟨by ring, ?_, ?_⟩
  · linear_combination -hs + (Real.sqrt 74 : ℂ) ^ 2 * Complex.I_sq
  · linear_combination 144 * (-hs + (Real.sqrt 74 : ℂ) ^ 2 * Complex.I_sq)

/-- **La paraplérose**, question 4. The second formula: from `x⁴ = Z − Gx² − Bx`,
`(x² + F/2)² = (F − G)x² − Bx + Z + F²/4`; this is the square of `√(F−G) x − B/(2√(F−G))` when
`(F − G)(F² + 4Z) = B²`, i.e. `F³ − GF² + 4ZF = B² + 4ZG`; and with `F = u + G` this is the first
resolvent for `G' = G/2`. -/
theorem paraplerose_second_formula (G B Z F x : ℝ) :
    (x ^ 4 = Z - G * x ^ 2 - B * x →
      (x ^ 2 + F / 2) ^ 2 = (F - G) * x ^ 2 - B * x + Z + F ^ 2 / 4) ∧
    ((F - G) * (F ^ 2 + 4 * Z) = B ^ 2 ↔ F ^ 3 - G * F ^ 2 + 4 * Z * F = B ^ 2 + 4 * Z * G) ∧
    (F ^ 3 - G * F ^ 2 + 4 * Z * F = B ^ 2 + 4 * Z * G ↔
      (F - G) ^ 3 + 4 * (G / 2) * (F - G) ^ 2 + (4 * Z + 4 * (G / 2) ^ 2) * (F - G) = B ^ 2) := by
  refine ⟨fun h => by linear_combination h, ⟨fun h => by linear_combination h,
    fun h => by linear_combination h⟩, ⟨fun h => by linear_combination h,
    fun h => by linear_combination h⟩⟩

/-- **La paraplérose**, question 4, theorem I « secundum posteriorem formulam » (view 116):
`G = 6`, `B² + 4ZG = 817600`, `F = 70` is a root, `70 − 6 = 8²`, and `x² + 8x = 55 − 35 = 20`. -/
theorem paraplerose_second_example :
    (880 : ℝ) ^ 2 + 4 * 1800 * 6 = 817600 ∧
    (70 : ℝ) ^ 3 - 6 * 70 ^ 2 + 4 * 1800 * 70 = 817600 ∧ (70 : ℝ) - 6 = 8 ^ 2 ∧
    (880 : ℝ) / (2 * 8) - 70 / 2 = 20 := by
  norm_num

/-- **La paraplérose**, question 5, theorem IIII of the second formula (view 117): for
`x⁴ − Gx² − Bx = Z` the resolvent is `F³ + GF² + 4ZF = B² − 4ZG`, not `B² + 4ZG`. For `G = 4`,
`B = 800`, `Z = 1600`: `B² − 4ZG = 614400` (the page's number; `B² + 4ZG` would be `665600`),
`F = 60` is a root of `F³ + 4F² + 6400F = 614400` but not with the page's `64N`
(`216000 + 14400 + 3840 = 234240`); then `x² − 8x = 20` gives `x = 10`, and
`x⁴ − 4x² − 800x − 1600 = (x − 10)(x + 2)(x² + 8x + 80)`. -/
theorem paraplerose_theorem_four (G B Z F x : ℝ) :
    (x ^ 4 = Z + G * x ^ 2 + B * x →
      (x ^ 2 + F / 2) ^ 2 = (F + G) * x ^ 2 + B * x + Z + F ^ 2 / 4) ∧
    ((F + G) * (F ^ 2 + 4 * Z) = B ^ 2 ↔ F ^ 3 + G * F ^ 2 + 4 * Z * F = B ^ 2 - 4 * Z * G) ∧
    ((800 : ℝ) ^ 2 - 4 * 1600 * 4 = 614400 ∧ (800 : ℝ) ^ 2 + 4 * 1600 * 4 = 665600) ∧
    (60 : ℝ) ^ 3 + 4 * 60 ^ 2 + 6400 * 60 = 614400 ∧ (60 : ℝ) ^ 3 + 4 * 60 ^ 2 + 64 * 60 = 234240 ∧
    ((60 : ℝ) + 4 = 8 ^ 2 ∧ (800 : ℝ) / (2 * 8) - 60 / 2 = 20 ∧ (10 : ℝ) ^ 2 - 8 * 10 = 20) ∧
    (10 : ℝ) ^ 4 - 4 * 10 ^ 2 - 800 * 10 = 1600 ∧
    x ^ 4 - 4 * x ^ 2 - 800 * x - 1600 = (x - 10) * (x + 2) * (x ^ 2 + 8 * x + 80) := by
  refine ⟨fun h => by linear_combination h, ⟨fun h => by linear_combination h,
    fun h => by linear_combination h⟩, by norm_num, by norm_num, by norm_num, by norm_num,
    by norm_num, by ring⟩

end Germain.Exercises.Viete
