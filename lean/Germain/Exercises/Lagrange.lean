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

Not formalised: the dating of a note by the Republican calendar (`Dater un billet`), whose
arithmetic is a count of days; the uniform spherical shell, an improper integral.
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

end Germain.Exercises.Lagrange
