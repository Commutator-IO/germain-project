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

* « Le cas irréductible par deux triangles rectangles » (nal-1644, views 16–17):
  `irreducible_root`, `irreducible_angle`, `irreducible_example`, `irreducible_other_roots`,
  `irreducible_inverse`, `irreducible_conditions`, `irreducible_cardan`. The injectivity of
  `θ ↦ cos 3θ` on `]0, π/6[` (that `cos θ = 9/10` is the angle sought) is not proved.
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


/-! ## « Le cas irréductible par deux triangles rectangles » -/

open Real in
/-- **Le cas irréductible**, question 1. If `x = 2B cos θ`, then `x³ − 3B²x = 2B³ cos 3θ`; so if
the base of the first triangle is `B cos 3θ = D/2`, the double of the base of the second is a
root of `x³ − 3B²x = B²D`. -/
theorem irreducible_root (B D θ : ℝ) (hbase : B * cos (3 * θ) = D / 2) :
    (2 * B * cos θ) ^ 3 - 3 * B ^ 2 * (2 * B * cos θ) = 2 * B ^ 3 * cos (3 * θ) ∧
    (2 * B * cos θ) ^ 3 - 3 * B ^ 2 * (2 * B * cos θ) = B ^ 2 * D := by
  have h3 : (2 * B * cos θ) ^ 3 - 3 * B ^ 2 * (2 * B * cos θ) = 2 * B ^ 3 * cos (3 * θ) := by
    rw [cos_three_mul]; ring
  exact ⟨h3, by rw [h3]; linear_combination 2 * B ^ 2 * hbase⟩

open Real in
/-- **Le cas irréductible**, question 1. `B > D/2 > 0` is what makes the first triangle exist:
`3θ = arccos (D/2B)` lies in `]0, π/2[`. -/
theorem irreducible_angle (B D : ℝ) (hD : 0 < D) (hB : D / 2 < B) :
    0 < arccos (D / (2 * B)) ∧ arccos (D / (2 * B)) < π / 2 ∧
    B * cos (arccos (D / (2 * B))) = D / 2 := by
  have hB0 : 0 < B := by linarith
  have h1 : 0 < D / (2 * B) := by positivity
  have h2 : D / (2 * B) < 1 := by rw [div_lt_one (by positivity)]; linarith
  refine ⟨arccos_pos.2 h2, arccos_lt_pi_div_two.2 h1, ?_⟩
  rw [cos_arccos (by linarith) h2.le]; field_simp

/-- **Le cas irréductible**, question 2. For `x³ − 300x = 432`: `B = 10`, `D = 432/100`, the
first base is `216/100`; with `cos θ = 9/10`, `cos 3θ = 4 cos³θ − 3 cos θ = 216/1000`, the second
triangle has base `9` and height `√19`, and `x = 18`. -/
theorem irreducible_example :
    3 * (10 : ℝ) ^ 2 = 300 ∧ (10 : ℝ) ^ 2 * (432 / 100) = 432 ∧ (432 / 100 : ℝ) / 2 = 216 / 100 ∧
    4 * (9 / 10 : ℝ) ^ 3 - 3 * (9 / 10) = 216 / 1000 ∧ 10 * (216 / 1000 : ℝ) = 216 / 100 ∧
    10 * (9 / 10 : ℝ) = 9 ∧ (10 : ℝ) ^ 2 - 9 ^ 2 = 19 ∧ (18 : ℝ) ^ 3 - 300 * 18 = 432 := by
  norm_num

open Real in
/-- **Le cas irréductible**, question 3. `2B cos(θ ± 2π/3)` are roots too, equal to
`−B cos θ ∓ √3 B sin θ`, and negative for `0 < θ < π/6`, `B > 0`. -/
theorem irreducible_other_roots (B θ : ℝ) (hB : 0 < B) (hθ : 0 < θ) (hθ' : θ < π / 6) :
    cos (3 * (θ + 2 * π / 3)) = cos (3 * θ) ∧ cos (3 * (θ - 2 * π / 3)) = cos (3 * θ) ∧
    2 * B * cos (θ + 2 * π / 3) = -(B * cos θ) - √3 * (B * sin θ) ∧
    2 * B * cos (θ - 2 * π / 3) = -(B * cos θ) + √3 * (B * sin θ) ∧
    2 * B * cos (θ + 2 * π / 3) < 0 ∧ 2 * B * cos (θ - 2 * π / 3) < 0 := by
  have c23 : cos (2 * π / 3) = -(1 / 2) := by
    rw [show 2 * π / 3 = π - π / 3 by ring, cos_pi_sub, cos_pi_div_three]
  have s23 : sin (2 * π / 3) = √3 / 2 := by
    rw [show 2 * π / 3 = π - π / 3 by ring, sin_pi_sub, sin_pi_div_three]
  have e1 : 2 * B * cos (θ + 2 * π / 3) = -(B * cos θ) - √3 * (B * sin θ) := by
    rw [cos_add, c23, s23]; ring
  have e2 : 2 * B * cos (θ - 2 * π / 3) = -(B * cos θ) + √3 * (B * sin θ) := by
    rw [cos_sub, c23, s23]; ring
  -- `θ < π/6` gives `√3 sin θ < cos θ`
  have hc : 0 < cos θ := cos_pos_of_mem_Ioo ⟨by linarith, by linarith [pi_pos]⟩
  have hs : 0 < sin θ := sin_pos_of_pos_of_lt_pi hθ (by linarith [pi_pos])
  have key : √3 * sin θ < cos θ := by
    -- `cos θ − √3 sin θ = 2 cos(θ + π/3) > 0`
    have : cos θ - √3 * sin θ = 2 * cos (θ + π / 3) := by
      rw [cos_add, cos_pi_div_three, sin_pi_div_three]; ring
    have : 0 < cos (θ + π / 3) := cos_pos_of_mem_Ioo ⟨by linarith [pi_pos], by linarith⟩
    linarith
  have h3 : 0 ≤ √3 := sqrt_nonneg 3
  refine ⟨?_, ?_, e1, e2, ?_, ?_⟩
  · rw [show 3 * (θ + 2 * π / 3) = 3 * θ + (1 : ℕ) * (2 * π) by push_cast; ring,
      cos_add_nat_mul_two_pi]
  · rw [show 3 * (θ - 2 * π / 3) = 3 * θ - (1 : ℕ) * (2 * π) by push_cast; ring,
      cos_sub_nat_mul_two_pi]
  · rw [e1]; nlinarith [mul_pos hB hc, mul_nonneg h3 (mul_pos hB hs).le]
  · rw [e2]; nlinarith [mul_lt_mul_of_pos_left key hB]

/-- **Le cas irréductible**, question 3. If `x` is a root of `x³ − 3B²x = B²D`, `y = −x` is a root
of the inverse equation `3B²y − y³ = B²D`; for the example, `9 ± √57` are the roots of
`300y − y³ = 432` besides `−18`, and `x³ − 300x − 432 = (x − 18)(x² + 18x + 24)`. -/
theorem irreducible_inverse (B D x t : ℝ) (h : x ^ 3 - 3 * B ^ 2 * x = B ^ 2 * D) :
    3 * B ^ 2 * (-x) - (-x) ^ 3 = B ^ 2 * D ∧
    t ^ 3 - 300 * t - 432 = (t - 18) * (t ^ 2 + 18 * t + 24) ∧
    300 * (9 + √57) - (9 + √57) ^ 3 = 432 ∧ 300 * (9 - √57) - (9 - √57) ^ 3 = 432 ∧
    √57 ^ 2 = 3 * √19 ^ 2 := by
  have h57 : √(57 : ℝ) ^ 2 = 57 := Real.sq_sqrt (by norm_num)
  have h19 : √(19 : ℝ) ^ 2 = 19 := Real.sq_sqrt (by norm_num)
  refine ⟨by linear_combination h, by ring, ?_, ?_, by rw [h57, h19]; norm_num⟩
  · linear_combination (-27 - √57) * h57
  · linear_combination (√57 - 27) * h57

/-- **Le cas irréductible**, question 4. For `B, D > 0`, the condition `D'² < 4B'³` of theorem III,
written with `B' = B²` and `D' = B²D`, is `D < 2B`, the condition `B > D/2` of the « Aliter »;
for the example, `432² < 4·100³`. -/
theorem irreducible_conditions (B D : ℝ) (hB : 0 < B) (hD : 0 < D) :
    ((B ^ 2 * D) ^ 2 < 4 * (B ^ 2) ^ 3 ↔ D / 2 < B) ∧ (432 : ℝ) ^ 2 < 4 * 100 ^ 3 := by
  refine ⟨?_, by norm_num⟩
  have hB4 : 0 < B ^ 4 := by positivity
  constructor
  · intro h
    have h2 : D ^ 2 < 4 * B ^ 2 := by
      by_contra hn
      have := not_lt.1 hn
      nlinarith [mul_le_mul_of_nonneg_left this hB4.le]
    by_contra hn
    have h3 : 2 * B ≤ D := by have := not_lt.1 hn; linarith
    nlinarith [mul_le_mul h3 h3 (by positivity) (by linarith)]
  · intro h
    have h2 : D ^ 2 < 4 * B ^ 2 := by nlinarith
    nlinarith [mul_lt_mul_of_pos_left h2 hB4]

/-- **Le cas irréductible**, question 5. For `x³ − 300x = 432`, `Δ = q²/4 − p³/27 = −953344`
`= −224² · 19`; `(9 + i√19)³ = 216 + 224 i√19`; `u = 9 + i√19` and `v = 9 − i√19` have `uv = 100`
`= p/3` and `u + v = 18`. -/
theorem irreducible_cardan :
    (432 : ℝ) ^ 2 / 4 - 300 ^ 3 / 27 = -953344 ∧ (224 : ℝ) ^ 2 * 19 = 953344 ∧
    ((9 : ℂ) + Complex.I * √19) ^ 3 = 216 + 224 * Complex.I * √19 ∧
    ((9 : ℂ) + Complex.I * √19) * (9 - Complex.I * √19) = 100 ∧
    ((9 : ℂ) + Complex.I * √19) + (9 - Complex.I * √19) = 18 := by
  have hs : ((√19 : ℝ) : ℂ) ^ 2 = 19 := by
    rw [← Complex.ofReal_pow, Real.sq_sqrt (by norm_num)]; norm_num
  refine ⟨by norm_num, by norm_num, ?_, ?_, by ring⟩
  ·     linear_combination (27 * Complex.I ^ 2 + Complex.I ^ 3 * (√19 : ℂ)) * hs +
      (513 + 19 * Complex.I * (√19 : ℂ)) * Complex.I_sq
  · linear_combination (-(Complex.I ^ 2)) * hs - 19 * Complex.I_sq

end Germain.Exercises.Viete
