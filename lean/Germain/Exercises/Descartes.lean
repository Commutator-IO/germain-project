import Mathlib

/-!
# The René Descartes chapter of the exercise book

`exercises/exercices.fr.tex`, section « René Descartes (1596--1650) ». One group of theorems per
exercise, in the book's order; each docstring names the exercise and the question.

* « Une racine réelle et deux « rêveries » » (naf-5161, views 7–8): `reveries_factor`,
  `reveries_real_root`, `reveries_complex_roots`. Question 4, on what to call the roots, is not
  mathematics.
* « La règle des signes de Descartes, bien énoncée » (naf-5161, views 19–20): the factorisations
  and sign counts of questions 3–5, `signs_descartes_example`, `signs_objection`,
  `signs_missing_term`, `signs_one_negative_root`. The rule itself (questions 1–2) is not proved
  here.
* « Un second triangle rectangle d'aire 6 » (naf-5161, views 27–28): `area6_from_345`,
  `area6_doubling`, `area6_divide`, `area6_point_on_curve`, `area6_tangent_general`,
  `area6_tangent`, `area30_from_5_12_13`.

Not formalised: the centre of agitation of a cylindrical sector (physics).
-/

namespace Germain.Exercises.Descartes

/-! ## « Une racine réelle et deux « rêveries » » -/

/-- **Une racine réelle et deux « rêveries »**, question 1. `2` is a root, and the cubic is
`(x − 2)(x² − 4x + 5)`. -/
theorem reveries_factor (x : ℂ) :
    (2 : ℂ) ^ 3 - 6 * 2 ^ 2 + 13 * 2 - 10 = 0 ∧
    x ^ 3 - 6 * x ^ 2 + 13 * x - 10 = (x - 2) * (x ^ 2 - 4 * x + 5) := by
  constructor <;> ring

/-- **Une racine réelle et deux « rêveries »**, question 2. `2` is the only real root. -/
theorem reveries_real_root (x : ℝ) : x ^ 3 - 6 * x ^ 2 + 13 * x - 10 = 0 ↔ x = 2 := by
  constructor
  · intro h
    have hf : (x - 2) * ((x - 2) ^ 2 + 1) = 0 := by linear_combination h
    rcases mul_eq_zero.1 hf with h2 | h2
    · linarith
    · nlinarith [sq_nonneg (x - 2)]
  · rintro rfl; norm_num

/-- **Une racine réelle et deux « rêveries »**, question 3. Over `ℂ` the roots are `2`, `2 + i`
and `2 − i`: Descartes' count of one real root and two others. -/
theorem reveries_complex_roots (x : ℂ) :
    x ^ 3 - 6 * x ^ 2 + 13 * x - 10 = 0 ↔ x = 2 ∨ x = 2 + Complex.I ∨ x = 2 - Complex.I := by
  have hf : x ^ 3 - 6 * x ^ 2 + 13 * x - 10 =
      (x - 2) * (x - (2 + Complex.I)) * (x - (2 - Complex.I)) := by
    linear_combination (x - 2) * Complex.I_sq
  rw [hf]
  simp only [mul_eq_zero, sub_eq_zero, or_assoc]

/-! ## « La règle des signes de Descartes, bien énoncée » -/

/-- **La règle des signes**, question 3. Descartes' example: signs `+,−,−,+,−`, three changes
and three positive roots `2, 3, 4`; `P(−x)` has signs `+,+,−,−,−`, one change, and the negative
root is `−5`. -/
theorem signs_descartes_example (x : ℝ) :
    x ^ 4 - 4 * x ^ 3 - 19 * x ^ 2 + 106 * x - 120 = (x - 2) * (x - 3) * (x - 4) * (x + 5) ∧
    (-x) ^ 4 - 4 * (-x) ^ 3 - 19 * (-x) ^ 2 + 106 * (-x) - 120 =
      x ^ 4 + 4 * x ^ 3 - 19 * x ^ 2 - 106 * x - 120 := by
  constructor <;> ring

/-- **La règle des signes**, question 3. The objection `x³ − Bx² + B²x − B³`: three changes of
sign, one positive root `B` (and no other real root when `B ≠ 0`). The gap `3 − 1` is even. -/
theorem signs_objection (B x : ℝ) (hB : B ≠ 0) :
    x ^ 3 - B * x ^ 2 + B ^ 2 * x - B ^ 3 = (x - B) * (x ^ 2 + B ^ 2) ∧
    (x ^ 3 - B * x ^ 2 + B ^ 2 * x - B ^ 3 = 0 ↔ x = B) := by
  have hf : x ^ 3 - B * x ^ 2 + B ^ 2 * x - B ^ 3 = (x - B) * (x ^ 2 + B ^ 2) := by ring
  refine ⟨hf, ?_⟩
  rw [hf]
  have : x ^ 2 + B ^ 2 ≠ 0 := by positivity
  constructor
  · intro h; rcases mul_eq_zero.1 h with h | h
    · linarith
    · exact absurd h this
  · rintro rfl; ring

/-- **La règle des signes**, question 4. The two equations « where a term is missing » each have
a negative root, `−4` and `−2`. -/
theorem signs_missing_term (x : ℝ) :
    x ^ 3 - 13 * x + 12 = (x - 1) * (x - 3) * (x + 4) ∧
    x ^ 3 - x ^ 2 + 12 = (x + 2) * (x ^ 2 - 3 * x + 6) := by
  constructor <;> ring

/-- A continuous `f` with `f 0 > 0`, negative somewhere on `]−∞, 0[`, and with no two zeros there,
has exactly one negative zero. -/
private theorem unique_negative_zero (f : ℝ → ℝ) (hf : Continuous f) (h0 : 0 < f 0) (a : ℝ)
    (ha : a < 0) (hfa : f a < 0) (hinj : ∀ x y, x < y → y < 0 → f x = 0 → f y = 0 → False) :
    ∃! x : ℝ, x < 0 ∧ f x = 0 := by
  obtain ⟨c, ⟨hc1, hc2⟩, hc⟩ : 0 ∈ f '' Set.Icc a 0 :=
    intermediate_value_Icc ha.le hf.continuousOn ⟨hfa.le, h0.le⟩
  have hc0 : c < 0 := by
    rcases hc2.lt_or_eq with h | h
    · exact h
    · rw [h] at hc; linarith
  refine ⟨c, ⟨hc0, hc⟩, fun y ⟨hy0, hy⟩ => ?_⟩
  rcases lt_trichotomy y c with h | h | h
  · exact (hinj y c h hc0 hy hc).elim
  · exact h
  · exact (hinj c y h hy0 hc hy).elim

/-- **La règle des signes**, question 5. `x³ − sx + t` and `x³ − Bx² + t` (positive letters) each
have exactly one negative root: the author's « two false roots » cannot happen. Existence is the
intermediate value theorem between `−(1 + s + t)` (resp. `−(1 + t)`) and `0`; uniqueness is what
the single change of sign of `P(−x)` encodes. -/
theorem signs_one_negative_root (s B t : ℝ) (hs : 0 < s) (hB : 0 < B) (ht : 0 < t) :
    (∃! x : ℝ, x < 0 ∧ x ^ 3 - s * x + t = 0) ∧
    (∃! x : ℝ, x < 0 ∧ x ^ 3 - B * x ^ 2 + t = 0) := by
  constructor
  · refine unique_negative_zero (fun x => x ^ 3 - s * x + t) (by fun_prop) (by simpa using ht)
      (-(1 + s + t)) (by linarith) ?_ ?_
    · -- with `y = 1 + s + t ≥ 1`: `y³ − sy − t ≥ y² − sy − t = y(1 + t) − t ≥ 1`.
      have hy : (1 : ℝ) ≤ 1 + s + t := by linarith
      have h3 : (1 + s + t) ^ 2 ≤ (1 + s + t) ^ 3 := by
        nlinarith [sq_nonneg (1 + s + t)]
      show (-(1 + s + t)) ^ 3 - s * (-(1 + s + t)) + t < 0
      nlinarith
    · intro x y hxy hy hx0 hy0
      beta_reduce at hx0 hy0
      have h1 : (x - y) * (x ^ 2 + x * y + y ^ 2 - s) = 0 := by linear_combination hx0 - hy0
      have h2 : x ^ 2 + x * y + y ^ 2 = s := by
        rcases mul_eq_zero.1 h1 with h | h
        · exact absurd h (by linarith)
        · linarith
      -- then `0 = y³ − (x² + xy + y²)y + t = −xy(x + y) + t > 0`.
      have h3 : y ^ 3 - s * y + t = x * y * (-(x + y)) + t := by rw [← h2]; ring
      have hxy0 : 0 < x * y := mul_pos_of_neg_of_neg (by linarith) hy
      nlinarith [mul_pos hxy0 (show 0 < -(x + y) by linarith)]
  · refine unique_negative_zero (fun x => x ^ 3 - B * x ^ 2 + t) (by fun_prop) (by simpa using ht)
      (-(1 + t)) (by linarith) ?_ ?_
    · -- with `y = 1 + t ≥ 1`: `−y³ − By² + t ≤ −y + t = −1`.
      have h3 : 1 + t ≤ (1 + t) ^ 3 := by nlinarith [sq_nonneg t]
      show (-(1 + t)) ^ 3 - B * (-(1 + t)) ^ 2 + t < 0
      nlinarith [mul_pos hB (show (0 : ℝ) < (1 + t) ^ 2 by positivity)]
    · intro x y hxy hy hx0 hy0
      beta_reduce at hx0 hy0
      -- on `]−∞, 0[`, `x³ − Bx²` is strictly increasing.
      have h1 : (y ^ 3 - B * y ^ 2) - (x ^ 3 - B * x ^ 2) =
          (y - x) * (x ^ 2 + x * y + y ^ 2 - B * (x + y)) := by ring
      have h2 : 0 < x ^ 2 + x * y + y ^ 2 - B * (x + y) := by
        nlinarith [mul_pos_of_neg_of_neg (show x < 0 by linarith) hy, sq_nonneg x, sq_nonneg y,
          mul_pos hB (show 0 < -(x + y) by linarith)]
      nlinarith [mul_pos (sub_pos.2 hxy) h2]

/-! ## « Un second triangle rectangle d'aire 6 » -/

/-- « Former un triangle » of two numbers `p > q`. -/
def form (p q : ℚ) : ℚ × ℚ × ℚ := (p ^ 2 - q ^ 2, 2 * p * q, p ^ 2 + q ^ 2)

/-- **Un second triangle rectangle d'aire 6**, question 1. `(3,4) ↦ (7,24,25)`,
`(24,25) ↦ (49,1200,1201)`, of area `6·70²`, and the rational triangle
`(7/10, 120/7, 1201/70)` of area 6. -/
theorem area6_from_345 :
    form 4 3 = (7, 24, 25) ∧ form 25 24 = (49, 1200, 1201) ∧
    (1 / 2 : ℚ) * 49 * 1200 = 6 * 70 ^ 2 ∧
    (7 / 10 : ℚ) ^ 2 + (120 / 7) ^ 2 = (1201 / 70) ^ 2 ∧
    (1 / 2 : ℚ) * (7 / 10) * (120 / 7) = 6 := by
  norm_num [form]

/-- **Un second triangle rectangle d'aire 6**, question 2. From a rational right triangle
`(a, b, c)` of area `n`, the triangle formed of `c²` and `2ab` has sides `(a² − b²)²`, `4abc²`,
`c⁴ + 4a²b²` and area `n (2c(a² − b²))²`. -/
theorem area6_doubling (a b c n : ℚ) (hpyth : a ^ 2 + b ^ 2 = c ^ 2) (harea : a * b / 2 = n) :
    form (c ^ 2) (2 * a * b) = ((a ^ 2 - b ^ 2) ^ 2, 4 * a * b * c ^ 2, c ^ 4 + 4 * a ^ 2 * b ^ 2) ∧
    ((a ^ 2 - b ^ 2) ^ 2) ^ 2 + (4 * a * b * c ^ 2) ^ 2 = (c ^ 4 + 4 * a ^ 2 * b ^ 2) ^ 2 ∧
    (1 / 2) * (a ^ 2 - b ^ 2) ^ 2 * (4 * a * b * c ^ 2) = n * (2 * c * (a ^ 2 - b ^ 2)) ^ 2 := by
  have hc4 : c ^ 4 = (a ^ 2 + b ^ 2) ^ 2 := by rw [hpyth]; ring
  refine ⟨?_, ?_, ?_⟩
  · simp only [form, Prod.mk.injEq]
    exact ⟨by linear_combination hc4, by ring, by ring⟩
  · linear_combination (-((a ^ 2 - b ^ 2) ^ 2 + c ^ 4 - 4 * a ^ 2 * b ^ 2)) * hc4
  · rw [← harea]; ring

/-- **Un second triangle rectangle d'aire 6**, question 2, end. Dividing a right triangle of area
`n k²` by `k ≠ 0` gives a right triangle of area `n`: the new rational triangle. -/
theorem area6_divide (X Y Z n k : ℚ) (hk : k ≠ 0) (hpyth : X ^ 2 + Y ^ 2 = Z ^ 2)
    (harea : (1 / 2) * X * Y = n * k ^ 2) :
    (X / k) ^ 2 + (Y / k) ^ 2 = (Z / k) ^ 2 ∧ (1 / 2) * (X / k) * (Y / k) = n := by
  constructor
  · rw [div_pow, div_pow, div_pow, ← add_div, hpyth]
  · calc (1 / 2) * (X / k) * (Y / k) = ((1 / 2) * X * Y) / k ^ 2 := by ring
      _ = n := by rw [harea]; field_simp

/-- **Un second triangle rectangle d'aire 6**, question 3. The point
`M = (c²/4, c(b² − a²)/8)` lies on `y² = x³ − n²x`, `n = ab/2`. -/
theorem area6_point_on_curve (a b c : ℚ) (hpyth : a ^ 2 + b ^ 2 = c ^ 2) :
    (c * (b ^ 2 - a ^ 2) / 8) ^ 2 = (c ^ 2 / 4) ^ 3 - (a * b / 2) ^ 2 * (c ^ 2 / 4) := by
  have hc4 : c ^ 4 = (a ^ 2 + b ^ 2) ^ 2 := by rw [hpyth]; ring
  linear_combination (-(c ^ 2 / 64)) * hc4

/-- **Un second triangle rectangle d'aire 6**, question 4, in general. If `M = (x₀, y₀)` is on
`y² = x³ − 36x` and `λ` is the slope of the tangent (`2y₀λ = 3x₀² − 36`), the tangent
`y = λ(x − x₀) + y₀` meets the cubic in `(x − x₀)²(x − (λ² − 2x₀))`: the third abscissa is
`λ² − 2x₀`. -/
theorem area6_tangent_general (x₀ y₀ lam x : ℚ) (h : y₀ ^ 2 = x₀ ^ 3 - 36 * x₀)
    (hlam : lam * (2 * y₀) = 3 * x₀ ^ 2 - 36) :
    x ^ 3 - 36 * x - (lam * (x - x₀) + y₀) ^ 2 = (x - x₀) ^ 2 * (x - (lam ^ 2 - 2 * x₀)) := by
  linear_combination (-1 : ℚ) * h - (x - x₀) * hlam

/-- **Un second triangle rectangle d'aire 6**, question 4. For `(3,4,5)`, `M = (25/4, 35/8)` on
`y² = x³ − 36x`; the tangent has slope `1299/140`, and meets the curve again at
`x₂ = λ² − 2x₀ = (1201/140)² = c'²/4` with `c' = 1201/70`, the new triangle's hypotenuse. -/
theorem area6_tangent :
    (35 / 8 : ℚ) ^ 2 = (25 / 4) ^ 3 - 36 * (25 / 4) ∧
    (3 * (25 / 4 : ℚ) ^ 2 - 36) / (2 * (35 / 8)) = 1299 / 140 ∧
    (1299 / 140 : ℚ) ^ 2 - 2 * (25 / 4) = (1201 / 140) ^ 2 ∧
    (1201 / 140 : ℚ) ^ 2 = (1201 / 70) ^ 2 / 4 := by
  norm_num

/-- **Un second triangle rectangle d'aire 6**, question 5. From `(5, 12, 13)`:
`(119, 120, 169)`, then `(14161, 40560, 42961)` of area `30·3094²`, and the rational triangle
`(119/26, 1560/119, 42961/3094)` of area 30. -/
theorem area30_from_5_12_13 :
    form 12 5 = (119, 120, 169) ∧ form 169 120 = (14161, 40560, 42961) ∧
    (1 / 2 : ℚ) * 14161 * 40560 = 30 * 3094 ^ 2 ∧ (3094 : ℚ) = 2 * 13 * 119 ∧
    (14161 / 3094 : ℚ) = 119 / 26 ∧ (40560 / 3094 : ℚ) = 1560 / 119 ∧
    (119 / 26 : ℚ) ^ 2 + (1560 / 119) ^ 2 = (42961 / 3094) ^ 2 ∧
    (1 / 2 : ℚ) * (119 / 26) * (1560 / 119) = 30 := by
  norm_num [form]

end Germain.Exercises.Descartes
