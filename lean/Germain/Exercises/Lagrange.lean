import Mathlib

/-!
# The Joseph-Louis Lagrange chapter of the exercise book

`exercises/exercices.fr.tex`, section « Joseph-Louis Lagrange (1736--1813) ». One group of theorems
per exercise; each docstring names the exercise and the question.

* « L'équation x² − ay² = 1 dans un extrait de Turin » (fr-9115, view 749): `pell_lemma`,
  `pell_powers`, `pell_powers_real`, `pell_copy_square`, `pell_numbers`, `pell_xi_pos`,
  `pell_all_solutions`. The last is mathlib's `Pell.IsFundamental.eq_pow_of_nonneg`, restated;
  mathlib's fundamental solution is the one with the least `x > 1`, which is the least positive
  solution of the extract.

* « Un « paradoxe dans le Calcul intégral » : la couche sphérique uniforme » (naf-5166, views
  21–33, 41): `shell_integral`, `shell_two_cases`, `shell_G`, `shell_direct_identity`,
  `shell_direct_values`, `shell_rdrho`, `shell_rho_cubed`, `shell_rho_cubed_cases`,
  `shell_surface`. The integrals over the sphere are written in `μ`, after the factor `2π` of the
  longitude; differentiation under the integral sign and the vanishing of the part `μ ≤ 1 − δ`
  (question 4) are not formalised.

* « Dater un billet de Lagrange par le calendrier républicain » (naf-4073, view 29): `republican`,
  with Zeller's congruence for the weekdays. Question 1 is a remark on the reading.
-/

namespace Germain.Exercises.Lagrange

open Real

/-! ## « L'équation x² − ay² = 1 dans un extrait de Turin » -/

/-- **L'équation x² − ay² = 1**, question 1. The lemma of the extract (Brahmagupta's identity),
with either sign. -/
theorem pell_lemma (a x y x' y' : ℤ) :
    (x ^ 2 - a * y ^ 2) * (x' ^ 2 - a * y' ^ 2) = (x * x' + a * y * y') ^ 2 - a * (x * y' + y * x') ^ 2 ∧
    (x ^ 2 - a * y ^ 2) * (x' ^ 2 - a * y' ^ 2) = (x * x' - a * y * y') ^ 2 - a * (x * y' - y * x') ^ 2 := by
  constructor <;> ring

/-- The integers `X m`, `Y m` with `(p + q√a)^m = X m + Y m √a`: `X 0 = 1`, `Y 0 = 0`,
`X (m+1) = pX m + aqY m`, `Y (m+1) = qX m + pY m`. -/
def XY (a p q : ℤ) : ℕ → ℤ × ℤ
  | 0 => (1, 0)
  | m + 1 => (p * (XY a p q m).1 + a * q * (XY a p q m).2, q * (XY a p q m).1 + p * (XY a p q m).2)

/-- **L'équation x² − ay² = 1**, question 2. If `p² − aq² = 1`, every `(X m, Y m)` is a solution in
integers. -/
theorem pell_powers (a p q : ℤ) (h : p ^ 2 - a * q ^ 2 = 1) (m : ℕ) :
    (XY a p q m).1 ^ 2 - a * (XY a p q m).2 ^ 2 = 1 := by
  induction m with
  | zero => simp [XY]
  | succ m ih =>
    simp only [XY]
    linear_combination (p ^ 2 - a * q ^ 2) * ih + h

/-- **L'équation x² − ay² = 1**, question 2. The extract's formulas: for `a > 0`,
`x = ((p + q√a)^m + (p − q√a)^m)/2` and `y = ((p + q√a)^m − (p − q√a)^m)/(2√a)` are `X m` and
`Y m`. -/
theorem pell_powers_real (a p q : ℤ) (ha : 0 < a) (m : ℕ) :
    ((p + q * √a) ^ m + (p - q * √a) ^ m) / 2 = (XY a p q m).1 ∧
    ((p + q * √a) ^ m - (p - q * √a) ^ m) / (2 * √a) = (XY a p q m).2 := by
  have hs : √(a : ℝ) ^ 2 = a := sq_sqrt (by exact_mod_cast ha.le)
  have hs0 : √(a : ℝ) ≠ 0 := (sqrt_pos.2 (by exact_mod_cast ha)).ne'
  -- the two binomial powers, by induction
  have key : ∀ m : ℕ, (p + q * √a) ^ m = (XY a p q m).1 + (XY a p q m).2 * √a ∧
      (p - q * √a) ^ m = (XY a p q m).1 - (XY a p q m).2 * √a := by
    intro m
    induction m with
    | zero => simp [XY]
    | succ m ih =>
      rw [pow_succ, pow_succ, ih.1, ih.2]
      simp only [XY]
      push_cast
      constructor <;> linear_combination ((XY a p q m).2 * q) * hs
  obtain ⟨h1, h2⟩ := key m
  rw [h1, h2]
  constructor
  · ring
  · field_simp; ring

/-- **L'équation x² − ay² = 1**, question 2, `m = 2`. The copy's `q'` has a plus sign: the
quantity is `(p² + aq²)/√a`; with the minus sign, `q' = 2pq`, and `p' = p² + aq²`. -/
theorem pell_copy_square (a p q : ℝ) (ha : 0 < a) :
    ((p + q * √a) ^ 2 + (p - q * √a) ^ 2) / (2 * √a) = (p ^ 2 + a * q ^ 2) / √a ∧
    ((p + q * √a) ^ 2 - (p - q * √a) ^ 2) / (2 * √a) = 2 * p * q ∧
    ((p + q * √a) ^ 2 + (p - q * √a) ^ 2) / 2 = p ^ 2 + a * q ^ 2 := by
  have hs : √a ^ 2 = a := sq_sqrt ha.le
  have hs0 : √a ≠ 0 := (sqrt_pos.2 ha).ne'
  refine ⟨?_, ?_, ?_⟩
  · field_simp; linear_combination (2 * q ^ 2) * hs
  · field_simp; ring
  · linear_combination q ^ 2 * hs

/-- The copy's quantity for `m = 2` is not rational when `a` is not a square: it is
`(p² + aq²)/√a`, and `√a` is irrational. -/
theorem pell_copy_irrational (a p q : ℤ) (ha : 0 < a) (hsq : ¬IsSquare a) (hpq : p ^ 2 + a * q ^ 2 ≠ 0) :
    Irrational (((p : ℝ) ^ 2 + a * q ^ 2) / √a) := by
  have hirr : Irrational √(a : ℝ) := by
    rw [irrational_sqrt_intCast_iff]; exact ⟨hsq, ha.le⟩
  have : ((p : ℝ) ^ 2 + a * q ^ 2) / √a = ((p ^ 2 + a * q ^ 2 : ℤ) : ℚ) * (√a)⁻¹ := by
    push_cast; ring
  rw [this]
  exact (irrational_inv_iff.2 hirr).ratCast_mul (by exact_mod_cast hpq)

/-- **L'équation x² − ay² = 1**, question 3. For `a = 2`, `(3, 2)` gives `(17, 12)` and `(99, 70)`;
for `a = 13`, `(649, 180)` is a solution and the next is `(842401, 233640)`. -/
theorem pell_numbers :
    (3 : ℤ) ^ 2 - 2 * 2 ^ 2 = 1 ∧ XY 2 3 2 2 = (17, 12) ∧ XY 2 3 2 3 = (99, 70) ∧
    (17 : ℤ) ^ 2 - 2 * 12 ^ 2 = 1 ∧ (99 : ℤ) ^ 2 - 2 * 70 ^ 2 = 1 ∧
    (649 : ℤ) ^ 2 - 13 * 180 ^ 2 = 1 ∧ XY 13 649 180 2 = (842401, 233640) ∧
    (842401 : ℤ) ^ 2 - 13 * 233640 ^ 2 = 1 := by
  refine ⟨by norm_num, by decide, by decide, by norm_num, by norm_num, by norm_num, by decide,
    by norm_num⟩

/-- **L'équation x² − ay² = 1**, question 4. If `u² − av² = 1` and `ξ = u + v√a > 1`, then
`u > 0` and `v > 0`. -/
theorem pell_xi_pos (a u v : ℝ) (ha : 0 < a) (h : u ^ 2 - a * v ^ 2 = 1) (hξ : 1 < u + v * √a) :
    0 < u ∧ 0 < v := by
  have hs : √a ^ 2 = a := sq_sqrt ha.le
  have hsa : 0 < √a := sqrt_pos.2 ha
  -- `u − v√a = 1/ξ ∈ ]0, 1[`
  have hprod : (u + v * √a) * (u - v * √a) = 1 := by linear_combination h - v ^ 2 * hs
  have hξ0 : 0 < u + v * √a := by linarith
  have hinv : 0 < u - v * √a := by
    by_contra hn; have hn' := not_lt.1 hn; nlinarith
  have hlt : u - v * √a < 1 := by nlinarith
  constructor
  · linarith
  · have : 0 < v * √a := by linarith
    exact (pos_iff_pos_of_mul_pos this).2 hsa

/-- **L'équation x² − ay² = 1**, question 5. Lagrange's statement: if `a > 0` is not a square, there
is a fundamental solution `ε`, and every solution in nonnegative integers (`x > 0`, `y ≥ 0`) is a
power of it. This is mathlib's `Pell.IsFundamental.eq_pow_of_nonneg`. -/
theorem pell_all_solutions (a : ℤ) (ha : 0 < a) (hsq : ¬IsSquare a) :
    ∃ ε : Pell.Solution₁ a, Pell.IsFundamental ε ∧
      ∀ η : Pell.Solution₁ a, 0 < η.x → 0 ≤ η.y → ∃ m : ℕ, η = ε ^ m := by
  obtain ⟨ε, hε⟩ := Pell.IsFundamental.exists_of_not_isSquare ha hsq
  exact ⟨ε, hε, fun η hx hy => hε.eq_pow_of_nonneg hx hy⟩

/-- The powers of a solution follow the extract's recurrence: `(ε^(m+1)).x = p x_m + a q y_m` and
`(ε^(m+1)).y = q x_m + p y_m`, with `(p, q) = (ε.x, ε.y)`. -/
theorem pell_pow_succ (a : ℤ) (ε : Pell.Solution₁ a) (m : ℕ) :
    (ε ^ (m + 1)).x = ε.x * (ε ^ m).x + a * ε.y * (ε ^ m).y ∧
    (ε ^ (m + 1)).y = ε.y * (ε ^ m).x + ε.x * (ε ^ m).y := by
  rw [pow_succ', Pell.Solution₁.x_mul, Pell.Solution₁.y_mul]
  constructor <;> ring


/-! ## « Un « paradoxe dans le Calcul intégral » : la couche sphérique uniforme » -/

section Shell

open intervalIntegral

/-- The radicand `r² − 2arμ + a²` is at least `(r − a)²` for `μ ≤ 1`, `a, r > 0`. -/
private theorem radicand_pos (a r μ : ℝ) (ha : 0 < a) (hr : 0 < r) (hra : r ≠ a) (hμ : μ ≤ 1) :
    0 < r ^ 2 - 2 * a * r * μ + a ^ 2 := by
  have h1 : 0 < (r - a) ^ 2 := by have := sub_ne_zero.2 hra; positivity
  nlinarith [mul_le_mul_of_nonneg_left hμ (show 0 ≤ 2 * a * r by positivity)]

/-- **La couche sphérique**, question 1. With the pole on the radius `r` (`r ≠ a`),
`∫₋₁¹ dμ/√(r² − 2arμ + a²) = ((r + a) − |r − a|)/(ar)`; times `2π`, the integral over the sphere. -/
theorem shell_integral (a r : ℝ) (ha : 0 < a) (hr : 0 < r) (hra : r ≠ a) :
    ∫ μ in (-1 : ℝ)..1, 1 / √(r ^ 2 - 2 * a * r * μ + a ^ 2) = ((r + a) - |r - a|) / (a * r) := by
  have hq : ∀ μ ∈ Set.uIcc (-1 : ℝ) 1, 0 < r ^ 2 - 2 * a * r * μ + a ^ 2 := fun μ hμ =>
    radicand_pos a r μ ha hr hra (by rw [Set.uIcc_of_le (by norm_num)] at hμ; exact hμ.2)
  have hF : ∀ μ ∈ Set.uIcc (-1 : ℝ) 1, HasDerivAt (fun μ => -√(r ^ 2 - 2 * a * r * μ + a ^ 2) / (a * r))
      (1 / √(r ^ 2 - 2 * a * r * μ + a ^ 2)) μ := fun μ hμ => by
    have h0 := (hq μ hμ).ne'
    have h := ((((hasDerivAt_id μ).const_mul (2 * a * r)).const_sub (r ^ 2)).add_const (a ^ 2)).sqrt
      (by simpa using h0)
    have h2 := (h.neg).div_const (a * r)
    refine h2.congr_deriv ?_
    have hs : 0 < √(r ^ 2 - 2 * a * r * μ + a ^ 2) := Real.sqrt_pos.2 (hq μ hμ)
    simp only [id]
    field_simp
  rw [integral_eq_sub_of_hasDerivAt hF]
  · have e1 : r ^ 2 - 2 * a * r * 1 + a ^ 2 = (r - a) ^ 2 := by ring
    have e2 : r ^ 2 - 2 * a * r * (-1) + a ^ 2 = (r + a) ^ 2 := by ring
    rw [e1, e2, Real.sqrt_sq_eq_abs, Real.sqrt_sq_eq_abs, abs_of_pos (by linarith : 0 < r + a)]
    ring
  · apply ContinuousOn.intervalIntegrable
    apply ContinuousOn.div continuousOn_const
    · exact (Continuous.continuousOn (by fun_prop)).sqrt
    · intro μ hμ; exact (Real.sqrt_pos.2 (hq μ hμ)).ne'

/-- **La couche sphérique**, question 1. `((r + a) − |r − a|)/(ar)` is `2/r` outside (`r > a`) and
`2/a` inside (`r < a`): `u = 4πa³y'/r` and `u = 4πa²y'`, which agree at `r = a`. The leaf's
completion, `(r + a) − (r − a)`, is the case `r ≥ a`. -/
theorem shell_two_cases (a r : ℝ) (ha : 0 < a) (hr : 0 < r) :
    (a < r → ((r + a) - |r - a|) / (a * r) = 2 / r) ∧
    (r < a → ((r + a) - |r - a|) / (a * r) = 2 / a) ∧
    (4 * π * a ^ 3 / a = 4 * π * a ^ 2) := by
  refine ⟨fun h => ?_, fun h => ?_, by field_simp⟩
  · rw [abs_of_pos (by linarith)]; field_simp; ring
  · rw [abs_of_neg (by linarith)]; field_simp; ring

/-- **La couche sphérique**, question 2. Outside, `u = 4πa³y'/r`, `∂u/∂r = −4πa³y'/r²`,
`G = u/2 + r ∂u/∂r = −2πa³y'/r`; inside, `u = 4πa²y'`, `∂u/∂r = 0`, `G = 2πa²y'`. At `r = a`:
`G` jumps from `2πa²y'` to `−2πa²y'`, `∂u/∂r` from `0` to `−4πay'`; the leaf's
`u/2 + a ∂u/∂r` has the same one-sided values. -/
theorem shell_G (a y r : ℝ) (ha : 0 < a) (hr : 0 < r) :
    HasDerivAt (fun r => 4 * π * a ^ 3 * y / r) (-(4 * π * a ^ 3 * y / r ^ 2)) r ∧
    (4 * π * a ^ 3 * y / r) / 2 + r * (-(4 * π * a ^ 3 * y / r ^ 2)) = -(2 * π * a ^ 3 * y / r) ∧
    (4 * π * a ^ 2 * y) / 2 + r * 0 = 2 * π * a ^ 2 * y ∧
    -(2 * π * a ^ 3 * y / a) = -(2 * π * a ^ 2 * y) ∧ -(4 * π * a ^ 3 * y / a ^ 2) = -(4 * π * a * y) ∧
    (4 * π * a ^ 3 * y / a) / 2 + a * (-(4 * π * a ^ 3 * y / a ^ 2)) = -(2 * π * a ^ 2 * y) := by
  have hr0 := hr.ne'; have ha0 := ha.ne'
  refine ⟨?_, by field_simp; ring, by ring, by field_simp, by field_simp, by field_simp; ring⟩
  have := (hasDerivAt_inv hr0).const_mul (4 * π * a ^ 3 * y)
  refine (this.congr_deriv (by field_simp)).congr_of_eventuallyEq ?_
  exact Filter.Eventually.of_forall fun r => by simp [div_eq_mul_inv]

/-- **La couche sphérique**, question 3. At `r = a`, for `μ < 1`, `ρ = 1/(a√(2(1 − μ)))`,
`∂ρ/∂r = −(a − aμ)ρ³ = −1/(2√2 a²√(1 − μ))`, and `ρ/2 + a ∂ρ/∂r = 0`. -/
theorem shell_direct_identity (a μ : ℝ) (ha : 0 < a) (hμ : μ < 1) :
    let ρ := 1 / (a * √(2 * (1 - μ)))
    a ^ 2 - 2 * a * a * μ + a ^ 2 = 2 * a ^ 2 * (1 - μ) ∧
    -(a - a * μ) * ρ ^ 3 = -(1 / (2 * √2 * a ^ 2 * √(1 - μ))) ∧
    ρ / 2 + a * (-(a - a * μ) * ρ ^ 3) = 0 := by
  intro ρ
  have h1 : 0 < 1 - μ := by linarith
  have hs : √(2 * (1 - μ)) = √2 * √(1 - μ) := Real.sqrt_mul (by norm_num) _
  have h2 : √2 ^ 2 = 2 := Real.sq_sqrt (by norm_num)
  have h3 : √(1 - μ) ^ 2 = 1 - μ := Real.sq_sqrt h1.le
  have hs2 : 0 < √2 := by positivity
  have hs3 : 0 < √(1 - μ) := Real.sqrt_pos.2 h1
  refine ⟨by ring, ?_, ?_⟩
  · simp only [ρ]; rw [hs]; field_simp
    rw [h2, h3]; ring
  · simp only [ρ]; rw [hs]; field_simp
    rw [h2, h3]; ring

/-- **La couche sphérique**, question 3. `∫₋₁¹ (1 − μ)^{−1/2} dμ = 2√2`, so the direct values
`u_d = 4πa²y'` and `u'_d = −2πay'`, and `G_d = 0`: the mean of the two one-sided limits. -/
theorem shell_direct_values (a y : ℝ) :
    ∫ μ in (-1 : ℝ)..1, (1 - μ) ^ (-(1 / 2 : ℝ)) = 2 * √2 ∧
    (2 * π * a ^ 2 * y / √2) * (2 * √2) = 4 * π * a ^ 2 * y ∧
    -(2 * π * a * y / (2 * √2)) * (2 * √2) = -(2 * π * a * y) ∧
    (4 * π * a ^ 2 * y) / 2 + a * (-(2 * π * a * y)) = 0 ∧
    (0 : ℝ) = ((-(2 * π * a ^ 2 * y)) + 2 * π * a ^ 2 * y) / 2 ∧
    -(2 * π * a * y) = ((-(4 * π * a * y)) + 0) / 2 := by
  have hs : (0 : ℝ) < √2 := by positivity
  refine ⟨?_, by field_simp; ring, by field_simp, by ring, by ring, by ring⟩
  rw [intervalIntegral.integral_comp_sub_left (fun x => x ^ (-(1 / 2 : ℝ))) 1]
  norm_num
  rw [integral_rpow (Or.inl (by norm_num)), Real.zero_rpow (by norm_num), sub_zero,
    Real.sqrt_eq_rpow]
  norm_num
  ring

/-- **La couche sphérique**, question 4. For `r ≠ a`, with `q = r² − 2arμ + a²` and `ρ = q^{−1/2}`,
`r(r − aμ) = q/2 + (r² − a²)/2`, whence `r ∂ρ/∂r = −r(r − aμ)ρ³ = −ρ/2 − (r² − a²)ρ³/2`. -/
theorem shell_rdrho (a r μ ρ : ℝ) (hρ : ρ ^ 2 * (r ^ 2 - 2 * a * r * μ + a ^ 2) = 1) :
    r * (r - a * μ) = (r ^ 2 - 2 * a * r * μ + a ^ 2) / 2 + (r ^ 2 - a ^ 2) / 2 ∧
    -(r * (r - a * μ)) * ρ ^ 3 = -(ρ / 2) - (r ^ 2 - a ^ 2) * ρ ^ 3 / 2 := by
  constructor
  · ring
  · linear_combination (-(ρ / 2)) * hρ

/-- **La couche sphérique**, question 4. For `r ≠ a`, `∫₋₁¹ ρ³ dμ = (1/|r − a| − 1/(r + a))/(ar)`:
`2π` times it is `4π/(r(r² − a²))` outside and `4π/(a(a² − r²))` inside; the leaf's value holds
only outside. -/
theorem shell_rho_cubed (a r : ℝ) (ha : 0 < a) (hr : 0 < r) (hra : r ≠ a) :
    ∫ μ in (-1 : ℝ)..1, 1 / √(r ^ 2 - 2 * a * r * μ + a ^ 2) ^ 3 =
      (1 / |r - a| - 1 / (r + a)) / (a * r) := by
  have hq : ∀ μ ∈ Set.uIcc (-1 : ℝ) 1, 0 < r ^ 2 - 2 * a * r * μ + a ^ 2 := fun μ hμ =>
    radicand_pos a r μ ha hr hra (by rw [Set.uIcc_of_le (by norm_num)] at hμ; exact hμ.2)
  have hF : ∀ μ ∈ Set.uIcc (-1 : ℝ) 1,
      HasDerivAt (fun μ => (√(r ^ 2 - 2 * a * r * μ + a ^ 2))⁻¹ / (a * r))
      (1 / √(r ^ 2 - 2 * a * r * μ + a ^ 2) ^ 3) μ := fun μ hμ => by
    have hs : 0 < √(r ^ 2 - 2 * a * r * μ + a ^ 2) := Real.sqrt_pos.2 (hq μ hμ)
    have h := ((((hasDerivAt_id μ).const_mul (2 * a * r)).const_sub (r ^ 2)).add_const (a ^ 2)).sqrt
      (by simpa using (hq μ hμ).ne')
    have h2 := (h.inv hs.ne').div_const (a * r)
    refine h2.congr_deriv ?_
    simp only [id]
    field_simp
  rw [integral_eq_sub_of_hasDerivAt hF]
  · have e1 : r ^ 2 - 2 * a * r * 1 + a ^ 2 = (r - a) ^ 2 := by ring
    have e2 : r ^ 2 - 2 * a * r * (-1) + a ^ 2 = (r + a) ^ 2 := by ring
    rw [e1, e2, Real.sqrt_sq_eq_abs, Real.sqrt_sq_eq_abs, abs_of_pos (by linarith : 0 < r + a)]
    ring
  · apply ContinuousOn.intervalIntegrable
    apply ContinuousOn.div continuousOn_const
    · exact ((Continuous.continuousOn (by fun_prop)).sqrt).pow 3
    · intro μ hμ; exact pow_ne_zero 3 (Real.sqrt_pos.2 (hq μ hμ)).ne'

/-- **La couche sphérique**, question 4. The two cases of `2π (1/|r − a| − 1/(r + a))/(ar)`, and
`G = −a³(r² − a²)y'/2 · ∫ρ³ dΩ'` gives back question 2. -/
theorem shell_rho_cubed_cases (a r y : ℝ) (ha : 0 < a) (hr : 0 < r) :
    (a < r → 2 * π * ((1 / |r - a| - 1 / (r + a)) / (a * r)) = 4 * π / (r * (r ^ 2 - a ^ 2)) ∧
      -(a ^ 3 * (r ^ 2 - a ^ 2) * y / 2) * (4 * π / (r * (r ^ 2 - a ^ 2))) = -(2 * π * a ^ 3 * y / r)) ∧
    (r < a → 2 * π * ((1 / |r - a| - 1 / (r + a)) / (a * r)) = 4 * π / (a * (a ^ 2 - r ^ 2)) ∧
      -(a ^ 3 * (r ^ 2 - a ^ 2) * y / 2) * (4 * π / (a * (a ^ 2 - r ^ 2))) = 2 * π * a ^ 2 * y) := by
  have hr0 := hr.ne'; have ha0 := ha.ne'
  refine ⟨fun h => ?_, fun h => ?_⟩
  · have h1 : r - a ≠ 0 := by linarith
    have h2 : r ^ 2 - a ^ 2 ≠ 0 := by nlinarith
    rw [abs_of_pos (by linarith)]
    constructor <;> field_simp <;> ring
  · have h1 : a - r ≠ 0 := by linarith
    have h2 : a ^ 2 - r ^ 2 ≠ 0 := by nlinarith
    rw [abs_of_neg (by linarith), show -(r - a) = a - r by ring]
    constructor <;> field_simp <;> ring

/-- **La couche sphérique**, question 5. On the surface of the homogeneous sphere of radius
`a(1 + y)`, `V/2 + a ∂V/∂r = −(2πa²/3)(1 − y²)`; and `2πa³/(3r) − 4πa⁴/(3r²)` at `r = a(1 + y)`
is `−2πa²/3 + 2πa²y` up to `−(2πa²/3) y²(5 + 3y)/(1 + y)²`: the identity of n° 10, which needs
`u/2 + a ∂u/∂r = −2πa²y'`, the outer limit. -/
theorem shell_surface (a y : ℝ) (ha : 0 < a) (hy : 0 < 1 + y) :
    let r := a * (1 + y)
    (4 * π * a ^ 3 * (1 + y) ^ 3 / (3 * r)) / 2 + a * (-(4 * π * a ^ 3 * (1 + y) ^ 3 / (3 * r ^ 2))) =
      -(2 * π * a ^ 2 / 3) * (1 - y ^ 2) ∧
    2 * π * a ^ 3 / (3 * r) - 4 * π * a ^ 4 / (3 * r ^ 2) =
      -(2 * π * a ^ 2 / 3) + 2 * π * a ^ 2 * y - 2 * π * a ^ 2 / 3 * (y ^ 2 * (5 + 3 * y) / (1 + y) ^ 2) := by
  intro r
  have ha0 := ha.ne'; have hy0 := hy.ne'
  constructor <;> (simp only [r]; field_simp; ring)

end Shell


/-! ## « Dater un billet de Lagrange par le calendrier républicain » -/

/-- Zeller's congruence for a Gregorian date with month `m ∈ [3, 12]`: `0` is Saturday, `1` Sunday,
…, `4` Wednesday. -/
def zeller (y m d : ℕ) : ℕ :=
  (d + 13 * (m + 1) / 5 + y % 100 + y % 100 / 4 + y / 100 / 4 + 5 * (y / 100)) % 7

/-- **Dater un billet**, questions 2 and 3. The 17 germinal is day `6·30 + 17 = 197`, `196 = 28·7`
days after the 1 vendémiaire; the weekdays of the 1 vendémiaire of years I to XIV (Saturday,
Sunday, Monday, Wednesday, Thursday, Friday, Saturday, Monday, Tuesday, Wednesday, Thursday,
Saturday, Sunday, Monday): the only Wednesdays are years IV and X; the 17 germinal of those years
is `196` days after (`7 + 31 + 30 + 31 + 31 + 29 + 31 + 6` and `7 + 31 + 30 + 31 + 31 + 28 + 31 + 7`),
the 6 April 1796 and the 7 April 1802, both Wednesdays. -/
theorem republican :
    6 * 30 + 17 = 197 ∧ 196 = 28 * 7 ∧
    [zeller 1792 9 22, zeller 1793 9 22, zeller 1794 9 22, zeller 1795 9 23, zeller 1796 9 22,
      zeller 1797 9 22, zeller 1798 9 22, zeller 1799 9 23, zeller 1800 9 23, zeller 1801 9 23,
      zeller 1802 9 23, zeller 1803 9 24, zeller 1804 9 23, zeller 1805 9 23] =
      [0, 1, 2, 4, 5, 6, 0, 2, 3, 4, 5, 0, 1, 2] ∧
    7 + 31 + 30 + 31 + 31 + 29 + 31 + 6 = 196 ∧ 7 + 31 + 30 + 31 + 31 + 28 + 31 + 7 = 196 ∧
    zeller 1796 4 6 = 4 ∧ zeller 1802 4 7 = 4 := by
  decide

end Germain.Exercises.Lagrange
