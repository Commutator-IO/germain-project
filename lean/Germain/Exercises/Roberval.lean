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

* « Mercure, eau et vin dans les tubes de Rouen » (nal-2338, views 97–103): `rouen`, `rouen_law`.
  The law of the statics of fluids is admitted, as in the exercise; question 5 is physics.
* « Les lemmes de maximum empruntés à « D. Rob. » » (latin-11195, views 9–10): `max_first`,
  `max_second`, `max_third`, `max_fourth`. The existence of the positive roots when the minimum
  is negative (intermediate values) is not proved.
* « Le beau problème de M. Roberval : un cylindre oblique mesuré au compas » (naf-5161, view 42):
  `oblique_section`, `oblique_solution`. The two areas as elliptic integrals are not
  formalised.
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


/-! ## « Mercure, eau et vin dans les tubes de Rouen » -/

/-- **Les tubes de Rouen**, questions 1–4. `h_e = (55/24)(95/7) = 5225/168 = 31 + 17/168` against
`31 + 1/9`; the two heights give the ratio `448/33 = 13 + 19/33`; the wine `56/57` of the water, its
vacuum shorter by `5/9` foot, `20/3` inches; the tube: `h = 55/24 − (7/95)(3/2) = 4973/2280`, the
vacuum `727/2280` foot, and `3/2 = (95/7)(21/190)`; the rise for one foot of water, `7/95` foot,
`84/95` inch; `2 + 7/24` feet are `3575/48` cm. -/
theorem rouen :
    (55 / 24 : ℚ) * (95 / 7) = 5225 / 168 ∧ (5225 / 168 : ℚ) = 31 + 17 / 168 ∧
    ((280 / 9 : ℚ) / (55 / 24)) = 448 / 33 ∧ (448 / 33 : ℚ) = 13 + 19 / 33 ∧
    ((280 / 9 : ℚ) / (95 / 3)) = 56 / 57 ∧ (95 / 3 - 280 / 9 : ℚ) = 5 / 9 ∧ (5 / 9 : ℚ) * 12 = 20 / 3 ∧
    (55 / 24 - 7 / 95 * (3 / 2) : ℚ) = 4973 / 2280 ∧ (4 - (4973 / 2280 + 3 / 2) : ℚ) = 727 / 2280 ∧
    (3 / 2 : ℚ) = 95 / 7 * (21 / 190) ∧ (7 / 95 : ℚ) * 12 = 84 / 95 ∧
    (55 / 24 : ℚ) * (65 / 2) = 3575 / 48 := by
  norm_num

/-- **Les tubes de Rouen**, questions 3 and 4, the law. `ρ_m h + ρ_e h_e = ρ_m H` gives
`h_e = (ρ_m/ρ_e)(H − h)`; `ρ_m h' = ρ_m H + ρ_e e` gives `h' − H = (ρ_e/ρ_m) e`. -/
theorem rouen_law (ρm ρe h he H h' e : ℝ) (hm : ρm ≠ 0) (he0 : ρe ≠ 0) :
    (ρm * h + ρe * he = ρm * H → he = ρm / ρe * (H - h)) ∧
    (ρm * h' = ρm * H + ρe * e → h' - H = ρe / ρm * e) := by
  constructor <;> intro hh <;> field_simp <;> linarith

/-! ## « Les lemmes de maximum empruntés à « D. Rob. » » -/

/-- **Les lemmes de maximum**, question 1. With `z = 3ℓ²`, `ℓ > 0`:
`2ℓ³ − (zA − A³) = (A − ℓ)²(A + 2ℓ) ≥ 0` for `A ≥ 0`; the maximum `2ℓ³` is double the « defect »
`ℓ³`, and is `(2/3) z · ℓ`. -/
theorem max_first (ℓ A : ℝ) (hA : 0 ≤ A) (hℓ : 0 ≤ ℓ) :
    2 * ℓ ^ 3 - (3 * ℓ ^ 2 * A - A ^ 3) = (A - ℓ) ^ 2 * (A + 2 * ℓ) ∧
    3 * ℓ ^ 2 * A - A ^ 3 ≤ 2 * ℓ ^ 3 ∧ 3 * ℓ ^ 2 * ℓ - ℓ ^ 3 = 2 * ℓ ^ 3 ∧
    2 * ℓ ^ 3 = 2 / 3 * (3 * ℓ ^ 2) * ℓ := by
  refine ⟨by ring, by nlinarith [mul_nonneg (sq_nonneg (A - ℓ)) (by linarith : 0 ≤ A + 2 * ℓ)],
    by ring, by ring⟩

/-- **Les lemmes de maximum**, question 2. `4(u + v)³ − 27u²v = (u − 2v)²(4u + v) ≥ 0`: under
`u + v = x`, `u²v ≤ 4x³/27`, with equality at `u = 2v`. -/
theorem max_second (u v : ℝ) (hu : 0 ≤ u) (hv : 0 ≤ v) :
    4 * (u + v) ^ 3 - 27 * (u ^ 2 * v) = (u - 2 * v) ^ 2 * (4 * u + v) ∧
    u ^ 2 * v ≤ 4 / 27 * (u + v) ^ 3 := by
  refine ⟨by ring, by nlinarith [mul_nonneg (sq_nonneg (u - 2 * v)) (by linarith : 0 ≤ 4 * u + v)]⟩

/-- **Les lemmes de maximum**, question 3. `(A − B)(A − C)(A + B + C) = A³ − zA + T` with
`z = B² + BC + C²`, `T = BC(B + C)`; on `A ≥ 0`, `h(A) − h(A₀) = (A − A₀)²(A + 2A₀)` with `A₀² = z/3`,
so `h` has no positive root when its minimum `T − (2z/3)A₀` is positive; and that minimum is `≤ 0`
exactly when `27T² ≤ 4z³`. The existence of the roots (intermediate values) is not proved here. -/
theorem max_third (A B C A₀ z T : ℝ) (hA₀ : 0 ≤ A₀) (hz : A₀ ^ 2 = z / 3) (hT : 0 < T) :
    (A - B) * (A - C) * (A + B + C) = A ^ 3 - (B ^ 2 + B * C + C ^ 2) * A + B * C * (B + C) ∧
    (A ^ 3 - z * A + T) - (A₀ ^ 3 - z * A₀ + T) = (A - A₀) ^ 2 * (A + 2 * A₀) ∧
    A₀ ^ 3 - z * A₀ + T = T - 2 * z / 3 * A₀ ∧
    (T - 2 * z / 3 * A₀ ≤ 0 ↔ 27 * T ^ 2 ≤ 4 * z ^ 3) := by
  have hz' : z = 3 * A₀ ^ 2 := by linarith
  subst hz'
  refine ⟨by ring, by ring, by ring, ?_⟩
  constructor
  · intro h
    have : T ≤ 2 * A₀ ^ 3 := by nlinarith
    nlinarith [mul_le_mul this this hT.le (by positivity)]
  · intro h
    by_contra hn
    have h1 : 2 * A₀ ^ 3 < T := by nlinarith
    have : (2 * A₀ ^ 3) ^ 2 < T ^ 2 := by
      have : 0 ≤ 2 * A₀ ^ 3 := by positivity
      nlinarith
    nlinarith

/-- **Les lemmes de maximum**, question 4. `k(A) = A³ − xA² + T`: `k(A) − k(2x/3) = (A − 2x/3)²(A + x/3)`
and `k(2x/3) = T − 4x³/27`: the « limitation » `T ≤ 4x³/27`. -/
theorem max_fourth (A x T : ℝ) :
    (A ^ 3 - x * A ^ 2 + T) - ((2 * x / 3) ^ 3 - x * (2 * x / 3) ^ 2 + T) =
      (A - 2 * x / 3) ^ 2 * (A + x / 3) ∧
    (2 * x / 3) ^ 3 - x * (2 * x / 3) ^ 2 + T = T - 4 / 27 * x ^ 3 := by
  constructor <;> ring

/-! ## « Le beau problème de M. Roberval : un cylindre oblique mesuré au compas » -/

open Real in
/-- **Le cylindre oblique**, question 1. The projection of `(1, 0, 0)` on the plane orthogonal to
`w = (cos β, 0, sin β)` has length `sin β`, that of `(0, 1, 0)` length `1`: the right section is
an ellipse of half-axes `r` and `r sin β`. -/
theorem oblique_section (β : ℝ) (hβ : 0 ≤ sin β) :
    √((1 - cos β * cos β) ^ 2 + 0 ^ 2 + (0 - cos β * sin β) ^ 2) = sin β := by
  rw [show (1 - cos β * cos β) ^ 2 + 0 ^ 2 + (0 - cos β * sin β) ^ 2 = sin β ^ 2 by
    nlinarith [sin_sq_add_cos_sq β]]
  exact Real.sqrt_sq hβ

open Real in
/-- **Le cylindre oblique**, question 3. With `ρ = √(rℓ/cos β)` and `R = ρ cos β/2`:
`2R/ρ = cos β`, `8Rρ = 4rℓ` and `ρ > 2R` when `0 < cos β < 1`: the two surfaces
`4rℓ E(cos β)` and `8Rρ E(2R/ρ)` are equal. The elliptic integrals themselves (questions 1 and 2)
are not formalised. -/
theorem oblique_solution (r ℓ c : ℝ) (hr : 0 < r) (hℓ : 0 < ℓ) (hc : 0 < c) (hc1 : c < 1) :
    let ρ := √(r * ℓ / c)
    let R := ρ * c / 2
    2 * R / ρ = c ∧ 8 * R * ρ = 4 * r * ℓ ∧ 2 * R < ρ := by
  intro ρ R
  have hρ : 0 < ρ := Real.sqrt_pos.2 (by positivity)
  have hρ2 : ρ ^ 2 = r * ℓ / c := Real.sq_sqrt (by positivity)
  refine ⟨by simp only [R]; field_simp, ?_, ?_⟩
  · simp only [R]
    have : 8 * (ρ * c / 2) * ρ = 4 * c * ρ ^ 2 := by ring
    rw [this, hρ2]; field_simp
  · simp only [R]; nlinarith

end Germain.Exercises.Roberval
