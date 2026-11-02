import Mathlib

/-!
# The Gilles Personne de Roberval chapter of the exercise book

`exercises/exercices.fr.tex`, section « Gilles Personne de Roberval (1602--1675) ».

* « Le centre des demi-fuseaux paraboliques » (nal-2338, view 83): `fuseau_volume`,
  `fuseau_moment`, `fuseau_centre`, `fuseau_ratios`, `fuseau_cone`. The integrals are written in
  the variable `t = s/a ∈ [0, 1]`, in which the ratio to the cylinder and `s̄/a` do not depend on
  `a` and `h`; that the section is a disc of radius `h(1 − (s/a)ⁿ)` and the formula for the centre
  of gravity of a solid of revolution are taken as the exercise takes them.
* « Les paraboles de tous les degrés, selon la description de Libri » (naf-9544, views 42–49):
  `parabola_area`, `conoid_volume`, `fuseau_eight_fifteenths`.

Not formalised: the mixtures in the tubes of Rouen (physics), the lemmas of maximum (category 1
material left for later), the oblique cylinder measured with the compass.
-/

namespace Germain.Exercises.Roberval

open Real intervalIntegral

/-- `∫₀¹ tᵏ = 1/(k+1)`. -/
private theorem integral_pow01 (k : ℕ) : ∫ t in (0 : ℝ)..1, t ^ k = 1 / (k + 1) := by
  rw [integral_pow]; simp

private theorem ii (k : ℕ) : IntervalIntegrable (fun t : ℝ => t ^ k) MeasureTheory.volume 0 1 :=
  (continuous_pow k).intervalIntegrable 0 1

/-! ## « Le centre des demi-fuseaux paraboliques » -/

/-- **Le centre des demi-fuseaux**, question 1. `∫₀¹ (1 − tⁿ)² dt = 1 − 2/(n+1) + 1/(2n+1)`
`= 2n²/((n+1)(2n+1))`: the ratio of the half-spindle to its cylinder. -/
theorem fuseau_volume (n : ℕ) :
    ∫ t in (0 : ℝ)..1, (1 - t ^ n) ^ 2 = 2 * (n : ℝ) ^ 2 / ((n + 1) * (2 * n + 1)) := by
  have e : ∀ t : ℝ, (1 - t ^ n) ^ 2 = t ^ 0 - 2 * t ^ n + t ^ (2 * n) := fun t => by ring
  simp_rw [e]
  rw [integral_add ((ii 0).sub ((ii n).const_mul 2)) (ii _), integral_sub (ii 0)
    ((ii n).const_mul 2), integral_const_mul, integral_pow01, integral_pow01, integral_pow01]
  push_cast
  field_simp
  ring

/-- **Le centre des demi-fuseaux**, question 2. `∫₀¹ t (1 − tⁿ)² dt = 1/2 − 2/(n+2) + 1/(2n+2)`
`= n²/(2(n+1)(n+2))`. -/
theorem fuseau_moment (n : ℕ) :
    ∫ t in (0 : ℝ)..1, t * (1 - t ^ n) ^ 2 = (n : ℝ) ^ 2 / (2 * (n + 1) * (n + 2)) := by
  have e : ∀ t : ℝ, t * (1 - t ^ n) ^ 2 = t ^ 1 - 2 * t ^ (n + 1) + t ^ (2 * n + 1) := fun t => by
    ring
  simp_rw [e]
  rw [integral_add ((ii 1).sub ((ii _).const_mul 2)) (ii _), integral_sub (ii 1)
    ((ii _).const_mul 2), integral_const_mul, integral_pow01, integral_pow01, integral_pow01]
  push_cast
  field_simp
  ring

/-- **Le centre des demi-fuseaux**, question 2. The centre is at `s̄ = (2n+1)/(4(n+2)) a` from the
base: `s̄/a` is the quotient of the two integrals. -/
theorem fuseau_centre (n : ℕ) (hn : n ≠ 0) :
    (∫ t in (0 : ℝ)..1, t * (1 - t ^ n) ^ 2) / (∫ t in (0 : ℝ)..1, (1 - t ^ n) ^ 2) =
      (2 * (n : ℝ) + 1) / (4 * (n + 2)) := by
  rw [fuseau_volume, fuseau_moment]
  have : (n : ℝ) ≠ 0 := by exact_mod_cast hn
  field_simp
  ring

/-- **Le centre des demi-fuseaux**, question 3. The two parts of the axis are as
`(2n + 7) : (2n + 1)`: `11 : 5`, `13 : 7`, `15 : 9`, `17 : 11` for `n = 2, 3, 4, 5`, each term
growing by 2; and the volumes `8/15`, `9/14`, `32/45`, `25/33`. -/
theorem fuseau_ratios (n : ℕ) :
    (1 - (2 * n + 1) / (4 * (n + 2) : ℝ)) / ((2 * n + 1) / (4 * (n + 2))) = (2 * n + 7) / (2 * n + 1) ∧
    ((2 * 2 + 7 : ℝ) = 11 ∧ (2 * 2 + 1 : ℝ) = 5) ∧ ((2 * 3 + 7 : ℝ) = 13 ∧ (2 * 3 + 1 : ℝ) = 7) ∧
    ((2 * 4 + 7 : ℝ) = 15 ∧ (2 * 4 + 1 : ℝ) = 9) ∧ ((2 * 5 + 7 : ℝ) = 17 ∧ (2 * 5 + 1 : ℝ) = 11) ∧
    (2 * ((n : ℝ) + 1) + 7 = (2 * n + 7) + 2 ∧ 2 * ((n : ℝ) + 1) + 1 = (2 * n + 1) + 2) ∧
    ((2 * 2 ^ 2 : ℝ) / ((2 + 1) * (2 * 2 + 1)) = 8 / 15 ∧ (2 * 3 ^ 2 : ℝ) / ((3 + 1) * (2 * 3 + 1)) = 9 / 14 ∧
      (2 * 4 ^ 2 : ℝ) / ((4 + 1) * (2 * 4 + 1)) = 32 / 45 ∧
      (2 * 5 ^ 2 : ℝ) / ((5 + 1) * (2 * 5 + 1)) = 25 / 33) := by
  have h1 : (2 * n + 1 : ℝ) ≠ 0 := by positivity
  have h2 : (4 * ((n : ℝ) + 2)) ≠ 0 := by positivity
  refine ⟨?_, by norm_num, by norm_num, by norm_num, by norm_num, ⟨by ring, by ring⟩, by norm_num⟩
  field_simp
  ring

/-- **Le centre des demi-fuseaux**, question 4. For `n = 1` the rule gives `9 : 3 = 3 : 1`, and
`s̄ = a/4`, the centre of a cone; as `n → ∞`, `(2n + 7)/(2n + 1) → 1`, the centre of the
cylinder. -/
theorem fuseau_cone :
    (2 * 1 + 7 : ℝ) / (2 * 1 + 1) = 3 ∧ (2 * 1 + 1 : ℝ) / (4 * (1 + 2)) = 1 / 4 ∧
    Filter.Tendsto (fun n : ℕ => (2 * (n : ℝ) + 7) / (2 * n + 1)) Filter.atTop (nhds 1) := by
  refine ⟨by norm_num, by norm_num, ?_⟩
  -- `(2n + 7)/(2n + 1) = 1 + 6/(2n + 1)`
  have : (fun n : ℕ => (2 * (n : ℝ) + 7) / (2 * n + 1)) = fun n : ℕ => 1 + 6 / (2 * (n : ℝ) + 1) := by
    funext n; have : (2 * (n : ℝ) + 1) ≠ 0 := by positivity
    field_simp; ring
  rw [this]
  have h : Filter.Tendsto (fun n : ℕ => 6 / (2 * (n : ℝ) + 1)) Filter.atTop (nhds 0) := by
    apply Filter.Tendsto.div_atTop tendsto_const_nhds
    apply Filter.tendsto_atTop_add_const_right
    exact Filter.Tendsto.const_mul_atTop (by norm_num) tendsto_natCast_atTop_atTop
  simpa using (tendsto_const_nhds (x := (1 : ℝ))).add h

/-! ## « Les paraboles de tous les degrés, selon la description de Libri » -/

/-- **Les paraboles de tous les degrés**, question 1. `∫₀ᵃ xⁿ dx = a^{n+1}/(n+1)`, the fraction
`1/(n+1)` of the rectangle `a · aⁿ`. -/
theorem parabola_area (n : ℕ) (a : ℝ) :
    ∫ x in (0 : ℝ)..a, x ^ n = 1 / (n + 1) * (a * a ^ n) := by
  rw [integral_pow]
  have : (n : ℝ) + 1 ≠ 0 := by positivity
  field_simp
  ring

/-- **Les paraboles de tous les degrés**, question 2. The conoid of `x = yⁿ` about its axis:
`π ∫₀ᵃ x^{2/n} dx = n/(n+2) · π a^{2/n} a`, against the cylinder `π a^{2/n} a`; for the parabola
(`n = 2`), one half. -/
theorem conoid_volume (n : ℕ) (hn : n ≠ 0) (a : ℝ) (ha : 0 < a) :
    π * ∫ x in (0 : ℝ)..a, x ^ ((2 : ℝ) / n) = n / (n + 2) * (π * a ^ ((2 : ℝ) / n) * a) ∧
    (2 : ℝ) / (2 + 2) = 1 / 2 := by
  have hn' : (0 : ℝ) < n := by exact_mod_cast Nat.pos_of_ne_zero hn
  have hr : -1 < (2 : ℝ) / n := by
    have : 0 < (2 : ℝ) / n := by positivity
    linarith
  refine ⟨?_, by norm_num⟩
  rw [integral_rpow (Or.inl hr), Real.zero_rpow (by positivity), sub_zero,
    Real.rpow_add ha, Real.rpow_one]
  field_simp
  ring

/-- **Les paraboles de tous les degrés**, question 3. The spindle of `y = h(1 − x²/b²)`,
`−b ≤ x ≤ b`, about the `x`-axis: `π h² ∫_{−b}^{b} (1 − x²/b²)² dx = 8/15 · (2π h² b)`. -/
theorem fuseau_eight_fifteenths (h b : ℝ) (hb : b ≠ 0) :
    π * h ^ 2 * ∫ x in (-b)..b, (1 - x ^ 2 / b ^ 2) ^ 2 = 8 / 15 * (2 * π * h ^ 2 * b) := by
  have e : ∀ x : ℝ, (1 - x ^ 2 / b ^ 2) ^ 2 = x ^ 0 - 2 / b ^ 2 * x ^ 2 + 1 / b ^ 4 * x ^ 4 :=
    fun x => by field_simp; ring
  simp_rw [e]
  have i : ∀ k : ℕ, IntervalIntegrable (fun t : ℝ => t ^ k) MeasureTheory.volume (-b) b :=
    fun k => (continuous_pow k).intervalIntegrable _ _
  rw [integral_add ((i 0).sub ((i 2).const_mul _)) ((i 4).const_mul _),
    integral_sub (i 0) ((i 2).const_mul _), integral_const_mul, integral_const_mul,
    integral_pow, integral_pow, integral_pow]
  push_cast
  field_simp
  ring

end Germain.Exercises.Roberval
