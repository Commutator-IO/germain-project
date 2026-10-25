import Mathlib

/-!
# NAF 4073, view 42: the triangular number of a square

The modernised reading `transcripts/naf-4073/naf-4073.modern.tex` (« La seule mathématique du
volume : le triangulaire d'un carré ») reads the one line of mathematics of the volume, on the
address leaf of the unsigned letter of 13 March 1814 (view 42):
`((n² − n)/2)² + ((n² + n)/2)² = (n⁴ + n²)/2`, « le triangulaire d'un quarré est la somme des
quarrés des deux Triangulaires consécutifs », that is `T_{n−1}² + T_n² = T_{n²}` with
`T_k = k(k + 1)/2`. This is finding `naf-4073-triangular-note` of `src/content/findings.ts`
(a codicological finding: the identity itself is classical).

* `leaf_identity`: the leaf's formula, over any field of characteristic `≠ 2`.
* `two_mul_T`, `T_eq_choose`: `2 T_k = k(k + 1)` and `T_k = C(k + 1, 2)`.
* `T_add_T`, `T_succ_sub_T`: the two triangular numbers sum to the square and differ by its
  root.
* `triangular_of_square`: `T_n² + T_{n+1}² = T_{(n+1)²}` in `ℕ`, for every `n` (the reading's
  `T_{n−1}² + T_n² = T_{n²}` with `n + 1` for `n`, which avoids truncated subtraction);
  `triangular_of_square_choose`: `C(n, 2)² + C(n + 1, 2)² = C(n² + 1, 2)`.
* `nicomachus`, `triangular_of_square_cubes`: `∑_{i ≤ n} i³ = T_n²`, hence
  `T_{n²} = 2 T_n² − n³` (stated as `T_{(n+1)²} + (n + 1)³ = 2 T_{n+1}²`).
* `line_114`: the line `1 + 64 + 49` sums to `114`, which is neither triangular nor a square,
  and `1 + 64 ≠ 49`.

Not formalised: anything about the hand or the date of the note.
-/

namespace Germain.Naf4073

open Finset

/-- The leaf's formula. -/
theorem leaf_identity {K : Type*} [Field K] [NeZero (2 : K)] (n : K) :
    ((n ^ 2 - n) / 2) ^ 2 + ((n ^ 2 + n) / 2) ^ 2 = (n ^ 4 + n ^ 2) / 2 := by
  field_simp
  ring

/-- The `k`-th triangular number `k(k + 1)/2`. -/
def T (k : ℕ) : ℕ := k * (k + 1) / 2

lemma two_mul_T (k : ℕ) : 2 * T k = k * (k + 1) :=
  Nat.mul_div_cancel' (Nat.even_mul_succ_self k).two_dvd

lemma T_eq_choose (k : ℕ) : T k = (k + 1).choose 2 := by
  rw [Nat.choose_two_right, T, Nat.add_sub_cancel, mul_comm]

/-- `T_n + T_{n+1} = (n + 1)²`: the two triangular numbers of the leaf sum to the square. -/
lemma T_add_T (n : ℕ) : T n + T (n + 1) = (n + 1) ^ 2 := by
  have h1 := two_mul_T n
  have h2 := two_mul_T (n + 1)
  nlinarith

/-- `T_{n+1} = T_n + (n + 1)`: they differ by its root. -/
lemma T_succ_sub_T (n : ℕ) : T (n + 1) = T n + (n + 1) := by
  have h1 := two_mul_T n
  have h2 := two_mul_T (n + 1)
  nlinarith

/-- **The note of NAF 4073**: `T_n² + T_{n+1}² = T_{(n+1)²}`, the triangular number of a
square is the sum of the squares of the two consecutive triangular numbers whose sum it is. -/
theorem triangular_of_square (n : ℕ) : T n ^ 2 + T (n + 1) ^ 2 = T ((n + 1) ^ 2) := by
  have h1 := two_mul_T n
  have h2 := two_mul_T (n + 1)
  have h3 := two_mul_T ((n + 1) ^ 2)
  have : 4 * (T n ^ 2 + T (n + 1) ^ 2) = 4 * T ((n + 1) ^ 2) := by
    calc 4 * (T n ^ 2 + T (n + 1) ^ 2) = (2 * T n) ^ 2 + (2 * T (n + 1)) ^ 2 := by ring
      _ = 2 * (2 * T ((n + 1) ^ 2)) := by rw [h1, h2, h3]; ring
      _ = 4 * T ((n + 1) ^ 2) := by ring
  omega

/-- The binomial form: `C(n, 2)² + C(n + 1, 2)² = C(n² + 1, 2)`, for every `n ≥ 1`. -/
theorem triangular_of_square_choose (n : ℕ) (hn : 1 ≤ n) :
    n.choose 2 ^ 2 + (n + 1).choose 2 ^ 2 = (n ^ 2 + 1).choose 2 := by
  obtain ⟨m, rfl⟩ : ∃ m, n = m + 1 := ⟨n - 1, by omega⟩
  rw [← T_eq_choose, ← T_eq_choose, ← T_eq_choose]
  exact triangular_of_square m

/-- Nicomachus: `∑_{i ≤ n} i³ = T_n²`. -/
theorem nicomachus (n : ℕ) : ∑ i ∈ range (n + 1), i ^ 3 = T n ^ 2 := by
  induction n with
  | zero => simp [T]
  | succ n ih =>
    rw [sum_range_succ, ih]
    have h1 := two_mul_T n
    have h2 := two_mul_T (n + 1)
    have : 4 * (T n ^ 2 + (n + 1) ^ 3) = 4 * T (n + 1) ^ 2 := by
      calc 4 * (T n ^ 2 + (n + 1) ^ 3) = (2 * T n) ^ 2 + 4 * (n + 1) ^ 3 := by ring
        _ = (2 * T (n + 1)) ^ 2 := by rw [h1, h2]; ring
        _ = 4 * T (n + 1) ^ 2 := by ring
    omega

/-- **`T_{n²} = 2 T_n² − n³`**, twice the sum of the first `n` cubes less the last. -/
theorem triangular_of_square_cubes (n : ℕ) :
    T ((n + 1) ^ 2) + (n + 1) ^ 3 = 2 * T (n + 1) ^ 2 := by
  have h := triangular_of_square n
  have h1 := two_mul_T n
  have h2 := two_mul_T (n + 1)
  have : T (n + 1) ^ 2 = T n ^ 2 + (n + 1) ^ 3 := by
    have e : 4 * T (n + 1) ^ 2 = 4 * (T n ^ 2 + (n + 1) ^ 3) := by
      calc 4 * T (n + 1) ^ 2 = (2 * T (n + 1)) ^ 2 := by ring
        _ = (2 * T n) ^ 2 + 4 * (n + 1) ^ 3 := by rw [h1, h2]; ring
        _ = 4 * (T n ^ 2 + (n + 1) ^ 3) := by ring
    omega
  omega

/-- The line `1 + 64 + 49` of the leaf: its sum `114` is neither triangular nor a square, and
`1 + 64 = 49` is false. -/
theorem line_114 :
    1 + 64 + 49 = 114 ∧ (∀ k, T k ≠ 114) ∧ (∀ m : ℕ, m ^ 2 ≠ 114) ∧ 1 + 64 ≠ 49 := by
  refine ⟨rfl, fun k hk => ?_, fun m hm => ?_, by norm_num⟩
  · have h := two_mul_T k
    rw [hk] at h
    have : k ≤ 15 := by nlinarith
    interval_cases k <;> omega
  · have : m ≤ 11 := by nlinarith
    interval_cases m <;> omega

end Germain.Naf4073
