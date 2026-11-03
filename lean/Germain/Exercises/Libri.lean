import Mathlib

/-!
# The Guillaume Libri chapter of the exercise book

`exercises/exercices.fr.tex`, section « Guillaume Libri (1803--1869) ».

* « Le coefficient binomial central et la décomposition en deux carrés » (fr-9118, view 65):
  `libri_product`, `libri_gauss_checks`, `libri_determines_a`, `libri_wilson_square`,
  `libri_square_of_product`, `libri_first_false`. Gauss's congruence `C(2k, k) ≡ 2a (mod p)` is
  admitted, as in the exercise, and appears as a hypothesis; Wilson's theorem is mathlib's
  `ZMod.wilsons_lemma`.

* « Un nombre quelconque de constantes arbitraires » (naf-4073, view 39): `four_constants`. The
  isomorphism of question 1 (Cauchy–Lipschitz) is not formalised.
* « La chaleur comme vibration » (naf-4073, view 39): `telegraph_roots`, `telegraph_limit`,
  `heat_kernel_pos`, `telegraph_waves`. That the kernel solves the heat equation, and the types of
  the equations, are not formalised.
-/

namespace Germain.Exercises.Libri

open Finset

/-! ## « Le coefficient binomial central et la décomposition en deux carrés » -/

/-- **Le coefficient binomial central**, question 1. `∏_{j=1}^k (4j − 2)/j = C(2k, k)`. -/
theorem libri_product (k : ℕ) :
    ∏ j ∈ Icc 1 k, ((4 * j - 2 : ℚ) / j) = (2 * k).choose k := by
  induction k with
  | zero => simp
  | succ k ih =>
    rw [prod_Icc_succ_top (by omega), ih]
    have h := Nat.succ_mul_centralBinom_succ k
    rw [Nat.centralBinom_eq_two_mul_choose, Nat.centralBinom_eq_two_mul_choose] at h
    have h' : ((k : ℚ) + 1) * ((2 * (k + 1)).choose (k + 1) : ℕ) =
        2 * (2 * k + 1) * ((2 * k).choose k : ℕ) := by exact_mod_cast h
    push_cast
    field_simp
    linear_combination -h'

/-- **Le coefficient binomial central**, question 2. `C(2k, k) ≡ 2a (mod p)` with `a ≡ 1 (mod 4)`
for `p = 13, 17, 29, 37, 41`: `a = −3, 1, 5, 1, 5`. -/
theorem libri_gauss_checks :
    (13 : ℤ) = (-3) ^ 2 + 2 ^ 2 ∧ ((Nat.choose 6 3 : ℤ) - 2 * (-3)) % 13 = 0 ∧
    (17 : ℤ) = 1 ^ 2 + 4 ^ 2 ∧ ((Nat.choose 8 4 : ℤ) - 2 * 1) % 17 = 0 ∧
    (29 : ℤ) = 5 ^ 2 + 2 ^ 2 ∧ ((Nat.choose 14 7 : ℤ) - 2 * 5) % 29 = 0 ∧
    (37 : ℤ) = 1 ^ 2 + 6 ^ 2 ∧ ((Nat.choose 18 9 : ℤ) - 2 * 1) % 37 = 0 ∧
    (41 : ℤ) = 5 ^ 2 + 4 ^ 2 ∧ ((Nat.choose 20 10 : ℤ) - 2 * 5) % 41 = 0 ∧
    (-3 : ℤ) % 4 = 1 ∧ (5 : ℤ) % 4 = 1 := by
  decide

/-- **Le coefficient binomial central**, question 3. If `p > 16`, `a² < p` and `a'² < p`, then
`2a ≡ 2a' (mod p)` forces `a = a'`: the residue of `C(2k, k)` determines `a`. -/
theorem libri_determines_a (p a a' : ℤ) (hp : 16 < p) (ha : a ^ 2 < p) (ha' : a' ^ 2 < p)
    (h : p ∣ 2 * a - 2 * a') : a = a' := by
  obtain ⟨c, hc⟩ := h
  -- `(2a − 2a')² ≤ 8(a² + a'²) < 16p < p²`, so `c = 0`.
  have h16 : 16 * p < p * p := by nlinarith
  have h1 : (p * c) ^ 2 < p ^ 2 := by
    rw [← hc]; nlinarith [sq_nonneg (a + a')]
  have hc0 : c = 0 := by
    have hp0 : 0 < p ^ 2 := by positivity
    have hc2 : c ^ 2 < 1 := by
      by_contra hn
      have : p ^ 2 * 1 ≤ p ^ 2 * c ^ 2 := mul_le_mul_of_nonneg_left (not_lt.1 hn) hp0.le
      nlinarith
    nlinarith [sq_nonneg c]
  rw [hc0] at hc; linarith

/-- **Le coefficient binomial central**, question 4, first half. For `p = 4k + 1` prime,
`((2k)!)² ≡ −1 (mod p)`: Wilson's theorem, in mathlib as `ZMod.half_factorial_sq_eq_neg_one`. -/
theorem libri_wilson_square (k : ℕ) (hp : (4 * k + 1).Prime) :
    (((2 * k).factorial : ZMod (4 * k + 1))) ^ 2 = -1 := by
  have := Fact.mk hp
  have := ZMod.half_factorial_sq_eq_neg_one (p := 4 * k + 1) (by omega)
  rwa [show (4 * k + 1 - 1) / 2 = 2 * k by omega] at this

/-- **Le coefficient binomial central**, question 4. In `ZMod p` (any field): write `f = (2k)!`,
`K = k!`, `c = C(2k, k)`, so that `c K² = f`. If `f² = −1`, Gauss's `c = 2a` and `a² = −b²` with
`b ≠ 0` (and `2 ≠ 0`: `p` odd), then the square of `(k+1)⋯(2k) = f/K` is `±2b`. -/
theorem libri_square_of_product {F : Type*} [Field F] (f c a b K : F) (hf : f ^ 2 = -1)
    (hc : c * K ^ 2 = f) (hgauss : c = 2 * a) (hab : a ^ 2 = -b ^ 2) (hb : b ≠ 0) (h2 : (2 : F) ≠ 0) :
    (f / K) ^ 2 = 2 * b ∨ (f / K) ^ 2 = -(2 * b) := by
  have hf0 : f ≠ 0 := by rintro rfl; norm_num at hf
  have hK : K ≠ 0 := by rintro rfl; simp at hc; exact hf0 hc.symm
  have ha : a ≠ 0 := by
    rintro rfl; rw [hgauss] at hc; simp at hc; exact hf0 hc.symm
  have hK2 : K ^ 2 = f / (2 * a) := by
    rw [hgauss] at hc; rw [eq_div_iff (mul_ne_zero h2 ha)]; linear_combination hc
  -- `(f/K)² = f²/K² = −2a/f`
  have key : (f / K) ^ 2 = -(2 * a) / f := by
    rw [div_pow, hf, hK2]; field_simp
  -- `f² = −1 = (a/b)²`, so `f = ±a/b`
  have hfab : (f - a / b) * (f + a / b) = 0 := by
    have : (f - a / b) * (f + a / b) = f ^ 2 - a ^ 2 / b ^ 2 := by ring
    rw [this, hf, hab, neg_div, div_self (pow_ne_zero 2 hb)]; ring
  rcases mul_eq_zero.1 hfab with h | h
  · right
    rw [key, show f = a / b by linear_combination h]; field_simp
  · left
    rw [key, show f = -(a / b) by linear_combination h]; field_simp

/-- **Le coefficient binomial central**, question 4, check for `p = 13`: `4·5·6 = 120 ≡ 3` and
`3² ≡ −4 = −2b` with `b = 2`. -/
theorem libri_square_check : (4 * 5 * 6 : ℤ) % 13 = 3 ∧ (3 ^ 2 - (-(2 * 2))) % 13 = 0 := by
  decide

/-- **Le coefficient binomial central**, question 5. The first congruence, without the square, is
false: for `p = 5` (`k = 1`, `b = 2`), `(k+1)⋯2k = 2` is neither `4` nor `−4` mod 5; for `p = 13`,
`4·5·6 = 120` is neither `4` nor `−4` mod 13. -/
theorem libri_first_false :
    ¬ ((2 - 4 : ℤ) % 5 = 0 ∨ (2 + 4 : ℤ) % 5 = 0) ∧
    ¬ ((120 - 4 : ℤ) % 13 = 0 ∨ (120 + 4 : ℤ) % 13 = 0) := by
  decide


/-! ## « Un nombre quelconque de constantes arbitraires » -/

open Real in
/-- **Constantes arbitraires**, question 2. `A cos t + B sin t + C cos(t − γ)` is
`(A + C cos γ) cos t + (B + C sin γ) sin t`: the four parameters give nothing more than two, and
different values give the same function. -/
theorem four_constants (A B C γ t : ℝ) :
    A * cos t + B * sin t + C * cos (t - γ) =
      (A + C * cos γ) * cos t + (B + C * sin γ) * sin t ∧
    (fun t : ℝ => 1 * cos t + 0 * sin t + 0 * cos (t - 0)) =
      (fun t : ℝ => 0 * cos t + 0 * sin t + 1 * cos (t - 0)) := by
  refine ⟨by rw [cos_sub]; ring, by funext t; simp⟩

/-! ## « La chaleur comme vibration : équation parabolique ou hyperbolique ? » -/

/-- **La chaleur comme vibration**, question 1. For `τ > 0` and `1 − 4τkq² ≥ 0`, the two values
`s± = (−1 ± √(1 − 4τkq²))/(2τ)` solve `τs² + s + kq² = 0`, and `s₊ = −2kq²/(1 + √(1 − 4τkq²))`, which
tends to `−kq²` as `τ → 0`; `s₋ ≤ −1/(2τ)`. -/
theorem telegraph_roots (τ k q : ℝ) (hτ : 0 < τ) (hd : 0 ≤ 1 - 4 * τ * k * q ^ 2) :
    let D := √(1 - 4 * τ * k * q ^ 2)
    τ * ((-1 + D) / (2 * τ)) ^ 2 + (-1 + D) / (2 * τ) + k * q ^ 2 = 0 ∧
    τ * ((-1 - D) / (2 * τ)) ^ 2 + (-1 - D) / (2 * τ) + k * q ^ 2 = 0 ∧
    (-1 + D) / (2 * τ) = -2 * k * q ^ 2 / (1 + D) ∧ (-1 - D) / (2 * τ) ≤ -1 / (2 * τ) := by
  intro D
  have hD : D ^ 2 = 1 - 4 * τ * k * q ^ 2 := Real.sq_sqrt hd
  have hD0 : 0 ≤ D := Real.sqrt_nonneg _
  have hτ0 := hτ.ne'
  refine ⟨?_, ?_, ?_, ?_⟩
  · field_simp; linear_combination hD
  · field_simp; linear_combination hD
  · rw [div_eq_div_iff (by positivity) (by positivity)]; linear_combination hD
  · apply div_le_div_of_nonneg_right (by linarith) (by positivity)

/-- **La chaleur comme vibration**, question 1, the limit. `−2kq²/(1 + √(1 − 4τkq²)) → −kq²` as
`τ → 0`. -/
theorem telegraph_limit (k q : ℝ) :
    Filter.Tendsto (fun τ : ℝ => -2 * k * q ^ 2 / (1 + √(1 - 4 * τ * k * q ^ 2))) (nhds 0)
      (nhds (-(k * q ^ 2))) := by
  have hc : Continuous (fun τ : ℝ => -2 * k * q ^ 2 / (1 + √(1 - 4 * τ * k * q ^ 2))) := by
    apply Continuous.div continuous_const (by fun_prop)
    intro τ; positivity
  have := hc.tendsto 0
  convert this using 2
  simp; ring

/-- **La chaleur comme vibration**, question 2. The heat kernel `e^{−x²/(4kt)}/√(4πkt)` is positive
everywhere for `t > 0`: infinite speed of propagation. -/
theorem heat_kernel_pos (k t x : ℝ) (hk : 0 < k) (ht : 0 < t) :
    0 < Real.exp (-x ^ 2 / (4 * k * t)) / √(4 * Real.pi * k * t) := by
  apply div_pos (Real.exp_pos _)
  exact Real.sqrt_pos.2 (by positivity)

/-- **La chaleur comme vibration**, question 3. Divided by `τ`, the equation is
`u_tt − c² u_xx = −u_t/τ` with `c² = k/τ`; for `4τkq² > 1` the roots
`−1/(2τ) ± i√(4τkq² − 1)/(2τ)` are complex, and oscillate. -/
theorem telegraph_waves (τ k utt ut uxx q : ℝ) (hτ : 0 < τ) (hk : 0 ≤ k) (hq : 1 < 4 * τ * k * q ^ 2) :
    (τ * utt + ut = k * uxx ↔ utt - √(k / τ) ^ 2 * uxx = -(ut / τ)) ∧
    let E := √(4 * τ * k * q ^ 2 - 1)
    (τ : ℂ) * ((-1 + E * Complex.I) / (2 * τ)) ^ 2 + (-1 + E * Complex.I) / (2 * τ) + k * q ^ 2 = 0 := by
  have hτ0 := hτ.ne'
  have hs : √(k / τ) ^ 2 = k / τ := Real.sq_sqrt (by positivity)
  refine ⟨?_, ?_⟩
  · rw [hs]; constructor <;> intro h <;> field_simp at h ⊢ <;> linarith
  · intro E
    have hE : ((E : ℝ) : ℂ) ^ 2 = 4 * τ * k * q ^ 2 - 1 := by
      rw [← Complex.ofReal_pow, Real.sq_sqrt (by linarith)]; push_cast; ring
    have hτc : (τ : ℂ) ≠ 0 := by exact_mod_cast hτ0
    have key : (τ : ℂ) * ((-1 + E * Complex.I) / (2 * τ)) ^ 2 + (-1 + E * Complex.I) / (2 * τ) +
        k * q ^ 2 = ((E : ℂ) ^ 2 * Complex.I ^ 2 - 1 + 4 * τ * k * q ^ 2) / (4 * τ) := by
      field_simp; ring
    rw [key, hE, Complex.I_sq]; ring

end Germain.Exercises.Libri
