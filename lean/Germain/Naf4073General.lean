import Germain.Naf4073

/-!
# NAF 4073: the general statements of the short article

`docs/naf-4073/article.tex`, second part (« Énoncés généraux »), extends Germain's computation
in the manuscript reproduced by Alexanderson (2012): expand `((n² ± n)/2)²`, then compare the
difference and the sum. This file proves every statement of that part.

* `T_cast`: `T k = k(k + 1)/2` in `ℚ`; `T_sub`: `T a − T b = (a − b)(a + b + 1)/2`.
* `T_mul` (proposition « produit »): `T (m n) = T m T n + T (m − 1) T (n − 1)`.
* `T_pow_split`, `T_pow_even`, `T_pow_step` (proposition « puissance de n »): the triangular
  number of a power of `n`.
* `step_sq`, `T_sq_sub_T_sq`, `T_sq_sub_T_sq_closed` (proposition « pas »):
  `T (b²) − T (a²) = a³ + 2(a+1)³ + ⋯ + 2(b−1)³ + b³ = (b² − a²)(a² + b² + 1)/2`.
* `T_pow_sub`, `T_pow_add` (proposition « puissances »):
  `T_{n+1}^k ∓ T_n^k = ((n+1)/2)^k ((n+2)^k ∓ n^k)`; `T_four_sub` for `k = 4`.
* `S`, `sum_odd_binom`, `T_pow_eq_sum` (proposition « sommes »):
  `2^(k−1) T_n^k = ∑_{m ≤ k, k − m odd} C(k, m) S_{k+m}`; `S_one`, `S_three`, `S_five`,
  `S_seven` for the first rows.
* `sum_even_binom`, `T_pow_eq_sum_even` (proposition 10): the even system;
  `S_two`, `S_four`, `S_six`, `S_eight`, `S_ten` for its first rows, and
  `S_even_eq_S_two_mul`: `S_{2k} = S₂ · R_k(S₁)` for every `k ≥ 1`.
* `gersonides`, `lagrange_unique` (proposition « Lagrange »): if `S_p = T^q` for every `n`,
  then `(p, q) = (1, 1)` or `(3, 2)`; `n = 2` alone forces it, through `2^p + 1 = 3^q`
  (Levi ben Gershon).

Proposition « Nicomaque » of the article is `triangular_of_square_cubes` in `Germain.Naf4073`.
-/

namespace Germain.Naf4073

open Finset

/-- `T k = k(k + 1)/2`, in `ℚ`. -/
lemma T_cast (k : ℕ) : (T k : ℚ) = k * (k + 1) / 2 := by
  have h : ((2 * T k : ℕ) : ℚ) = ((k * (k + 1) : ℕ) : ℚ) := by rw [two_mul_T]
  push_cast at h
  linarith

/-- The difference of two triangular numbers. -/
lemma T_sub (a b : ℕ) : (T a : ℚ) - T b = ((a : ℚ) - b) * (a + b + 1) / 2 := by
  rw [T_cast, T_cast]
  ring

/-! ## The triangular number of a product -/

/-- `T (m n) = T m T n + T (m − 1) T (n − 1)`; the note of NAF 4073 is `m = n`. -/
theorem T_mul (m n : ℕ) : T (m * n) = T m * T n + T (m - 1) * T (n - 1) := by
  rcases m with _ | a
  · simp [T]
  rcases n with _ | b
  · simp [T]
  have h : (T ((a + 1) * (b + 1)) : ℚ) = T (a + 1) * T (b + 1) + T a * T b := by
    rw [T_cast, T_cast, T_cast, T_cast, T_cast]
    push_cast
    ring
  simp only [Nat.add_sub_cancel]
  exact_mod_cast h

/-! ## The triangular number of a power of `n` -/

/-- `T (n^k) = T (n^j) T (n^(k−j)) + T (n^j − 1) T (n^(k−j) − 1)` for `j ≤ k`. -/
theorem T_pow_split (n k j : ℕ) (hj : j ≤ k) :
    T (n ^ k) = T (n ^ j) * T (n ^ (k - j)) + T (n ^ j - 1) * T (n ^ (k - j) - 1) := by
  rw [← T_mul, ← pow_add, Nat.add_sub_cancel' hj]

/-- An even power: `T (n^(2j)) = T (n^j)² + T (n^j − 1)²`. -/
theorem T_pow_even (n j : ℕ) : T (n ^ (2 * j)) = T (n ^ j) ^ 2 + T (n ^ j - 1) ^ 2 := by
  rw [show 2 * j = j + j by ring, pow_add, T_mul, sq, sq]

/-- The step between consecutive `k`-th powers:
`T ((n+1)^k) − T (n^k) = ((n+1)^k − n^k)((n+1)^k + n^k + 1)/2`. -/
theorem T_pow_step (n k : ℕ) :
    (T ((n + 1) ^ k) : ℚ) - T (n ^ k)
      = (((n : ℚ) + 1) ^ k - (n : ℚ) ^ k) * (((n : ℚ) + 1) ^ k + (n : ℚ) ^ k + 1) / 2 := by
  rw [T_sub]
  push_cast
  ring

/-! ## The steps of `T (n²)` -/

/-- `T ((a+1)²) = T (a²) + a³ + (a+1)³`, for every `a` (`square_step` starts at `a = 1`). -/
lemma step_sq (a : ℕ) : T ((a + 1) ^ 2) = T (a ^ 2) + a ^ 3 + (a + 1) ^ 3 := by
  have h : (T ((a + 1) ^ 2) : ℚ) = T (a ^ 2) + a ^ 3 + (a + 1) ^ 3 := by
    rw [T_cast, T_cast]
    push_cast
    ring
  exact_mod_cast h

/-- `T (b²) − T (a²) = a³ + 2(a+1)³ + ⋯ + 2(b−1)³ + b³`, with `b = a + d + 1`. -/
theorem T_sq_sub_T_sq (a d : ℕ) :
    T ((a + d + 1) ^ 2)
      = T (a ^ 2) + a ^ 3 + 2 * ∑ i ∈ Ico (a + 1) (a + d + 1), i ^ 3 + (a + d + 1) ^ 3 := by
  induction d with
  | zero => simpa using step_sq a
  | succ d ih =>
    rw [show a + (d + 1) + 1 = (a + d + 1) + 1 by ring, step_sq, ih,
      sum_Ico_succ_top (by omega : a + 1 ≤ a + d + 1)]
    ring

/-- The closed form: `2 (T (b²) − T (a²)) = (b² − a²)(a² + b² + 1)`. -/
theorem T_sq_sub_T_sq_closed (a b : ℕ) :
    2 * ((T (b ^ 2) : ℚ) - T (a ^ 2))
      = ((b : ℚ) ^ 2 - (a : ℚ) ^ 2) * ((a : ℚ) ^ 2 + (b : ℚ) ^ 2 + 1) := by
  rw [T_sub]
  push_cast
  ring

/-! ## Differences and sums of powers of consecutive triangular numbers -/

lemma T_succ_cast (n : ℕ) : (T (n + 1) : ℚ) = ((n + 1) / 2) * (n + 2) := by
  rw [T_cast]; push_cast; ring

lemma T_cast' (n : ℕ) : (T n : ℚ) = ((n + 1) / 2) * n := by
  rw [T_cast]; ring

/-- `T_{n+1}^k − T_n^k = ((n+1)/2)^k ((n+2)^k − n^k)`. -/
theorem T_pow_sub (n k : ℕ) :
    (T (n + 1) : ℚ) ^ k - (T n : ℚ) ^ k
      = (((n : ℚ) + 1) / 2) ^ k * (((n : ℚ) + 2) ^ k - (n : ℚ) ^ k) := by
  rw [T_succ_cast, T_cast', mul_pow, mul_pow]
  ring

/-- `T_{n+1}^k + T_n^k = ((n+1)/2)^k ((n+2)^k + n^k)`: `k = 1` is `T_n + T_{n+1} = (n+1)²`,
`k = 2` is the note. -/
theorem T_pow_add (n k : ℕ) :
    (T (n + 1) : ℚ) ^ k + (T n : ℚ) ^ k
      = (((n : ℚ) + 1) / 2) ^ k * (((n : ℚ) + 2) ^ k + (n : ℚ) ^ k) := by
  rw [T_succ_cast, T_cast', mul_pow, mul_pow]
  ring

/-- `k = 4`: Germain's difference times the note, `T_{n+1}⁴ − T_n⁴ = (n+1)³ T ((n+1)²)`. -/
theorem T_four_sub (n : ℕ) :
    T (n + 1) ^ 4 - T n ^ 4 = (n + 1) ^ 3 * T ((n + 1) ^ 2) := by
  have h1 := sq_T_succ n
  have h2 := triangular_of_square n
  have e : T (n + 1) ^ 4 = T n ^ 4 + (n + 1) ^ 3 * T ((n + 1) ^ 2) := by
    rw [← h2]
    calc T (n + 1) ^ 4 = (T (n + 1) ^ 2) ^ 2 := by ring
      _ = (T n ^ 2 + (n + 1) ^ 3) ^ 2 := by rw [h1]
      _ = T n ^ 4 + (n + 1) ^ 3 * (T n ^ 2 + (T n ^ 2 + (n + 1) ^ 3)) := by ring
      _ = T n ^ 4 + (n + 1) ^ 3 * (T n ^ 2 + T (n + 1) ^ 2) := by rw [h1]
  omega

/-! ## Sums of powers -/

/-- `S p n = 0^p + 1^p + ⋯ + n^p`. -/
def S (p n : ℕ) : ℕ := ∑ i ∈ range (n + 1), i ^ p

/-- `(x+1)^k − (x−1)^k = 2 ∑_{m ≤ k, k − m odd} C(k, m) x^m`. -/
lemma sum_odd_binom (x : ℚ) (k : ℕ) :
    (x + 1) ^ k - (x - 1) ^ k
      = 2 * ∑ m ∈ (range (k + 1)).filter (fun m => Odd (k - m)), (k.choose m : ℚ) * x ^ m := by
  rw [sub_eq_add_neg x 1, add_pow, add_pow, ← sum_sub_distrib, sum_filter, mul_sum]
  refine sum_congr rfl fun m _ => ?_
  rcases Nat.even_or_odd (k - m) with h | h
  · rw [ite_eq_right (Nat.not_odd_iff_even.mpr h), h.neg_one_pow]
    ring
  · rw [ite_eq_left h, h.neg_one_pow]
    ring

/-- The triangular system: `2^(k−1) T_n^k = ∑_{m ≤ k, k − m odd} C(k, m) S_{k+m}`, for `k ≥ 1`. -/
theorem T_pow_eq_sum (k n : ℕ) (hk : 1 ≤ k) :
    (2 : ℚ) ^ (k - 1) * (T n : ℚ) ^ k
      = ∑ m ∈ (range (k + 1)).filter (fun m => Odd (k - m)), (k.choose m : ℚ) * (S (k + m) n : ℚ) := by
  obtain ⟨k, rfl⟩ : ∃ j, k = j + 1 := ⟨k - 1, by omega⟩
  simp only [Nat.add_sub_cancel]
  induction n with
  | zero =>
    simp only [T, S, zero_add, sum_range_one]
    norm_num
  | succ n ih =>
    have hS : ∀ p, (S p (n + 1) : ℚ) = S p n + ((n : ℚ) + 1) ^ p := by
      intro p; simp [S, sum_range_succ _ (n + 1)]
    simp_rw [hS, mul_add, sum_add_distrib, ← ih]
    have hd := T_pow_sub n (k + 1)
    have hb := sum_odd_binom ((n : ℚ) + 1) (k + 1)
    have hsum : ∑ m ∈ (range (k + 1 + 1)).filter (fun m => Odd (k + 1 - m)),
        (((k + 1).choose m : ℚ) * ((n : ℚ) + 1) ^ (k + 1 + m))
        = ((n : ℚ) + 1) ^ (k + 1) * ∑ m ∈ (range (k + 1 + 1)).filter (fun m => Odd (k + 1 - m)),
          ((k + 1).choose m : ℚ) * ((n : ℚ) + 1) ^ m := by
      rw [mul_sum]; refine sum_congr rfl fun m _ => ?_; rw [pow_add]; ring
    rw [hsum]
    have e1 : (n : ℚ) + 1 + 1 = (n : ℚ) + 2 := by ring
    have e2 : (n : ℚ) + 1 - 1 = (n : ℚ) := by ring
    rw [e1, e2] at hb
    have hT : (T n : ℚ) ^ (k + 1) + (((n : ℚ) + 1) / 2) ^ (k + 1)
        * (((n : ℚ) + 2) ^ (k + 1) - (n : ℚ) ^ (k + 1)) = (T (n + 1) : ℚ) ^ (k + 1) := by
      rw [← hd]; ring
    rw [← hT, hb, div_pow]
    field_simp
    ring

/-- The first rows of the system, solved: `S₁ = T`, `S₃ = T²`, `3 S₅ = T²(4T − 1)`,
`3 S₇ = T²(6T² − 4T + 1)`. -/
theorem S_one (n : ℕ) : S 1 n = T n := by
  have h := T_pow_eq_sum 1 n le_rfl
  norm_num [show (range 2).filter (fun m => Odd (1 - m)) = {0} by decide] at h
  exact_mod_cast h.symm

theorem S_three (n : ℕ) : S 3 n = T n ^ 2 := by
  have h := T_pow_eq_sum 2 n (by norm_num)
  norm_num [show (range 3).filter (fun m => Odd (2 - m)) = {1} by decide] at h
  have h' : ((S 3 n : ℕ) : ℚ) = ((T n ^ 2 : ℕ) : ℚ) := by push_cast; linarith
  exact_mod_cast h'

theorem S_five (n : ℕ) : 3 * (S 5 n : ℚ) = (T n : ℚ) ^ 2 * (4 * T n - 1) := by
  have h3 := T_pow_eq_sum 3 n (by norm_num)
  norm_num [show (range 4).filter (fun m => Odd (3 - m)) = {0, 2} by decide] at h3
  have h2 : (S 3 n : ℚ) = (T n : ℚ) ^ 2 := by exact_mod_cast S_three n
  rw [h2] at h3
  linarith

theorem S_seven (n : ℕ) :
    3 * (S 7 n : ℚ) = (T n : ℚ) ^ 2 * (6 * (T n : ℚ) ^ 2 - 4 * T n + 1) := by
  have h4 := T_pow_eq_sum 4 n (by norm_num)
  norm_num [show (range 5).filter (fun m => Odd (4 - m)) = {1, 3} by decide] at h4
  have h5 := S_five n
  linarith

/-! ## Sums of even powers -/

/-- `(2x+1)(x+1)^k − (2x−1)(x−1)^k = ∑_{m ≤ k} C(k, m) (2 x^m if k − m is even, 4 x^(m+1) if odd)`. -/
lemma sum_even_binom (x : ℚ) (k : ℕ) :
    (2 * x + 1) * (x + 1) ^ k - (2 * x - 1) * (x - 1) ^ k
      = ∑ m ∈ range (k + 1),
          (k.choose m : ℚ) * (if Even (k - m) then 2 * x ^ m else 4 * x ^ (m + 1)) := by
  rw [sub_eq_add_neg x 1, add_pow, add_pow, mul_sum, mul_sum, ← sum_sub_distrib]
  refine sum_congr rfl fun m _ => ?_
  rcases Nat.even_or_odd (k - m) with h | h
  · rw [ite_eq_left h, h.neg_one_pow]
    ring
  · rw [ite_eq_right (Nat.not_even_iff_odd.mpr h), h.neg_one_pow]
    ring

/-- The even system: `2^(k−1) (2n+1) T_n^k = ∑_{m ≤ k} C(k, m) (S_{k+m} if k − m is even,
`2 S_{k+m+1}` if odd)`, for `k ≥ 1`; the leading term is `(2k+1) S_{2k}`. -/
theorem T_pow_eq_sum_even (k n : ℕ) (hk : 1 ≤ k) :
    (2 : ℚ) ^ (k - 1) * (2 * n + 1) * (T n : ℚ) ^ k
      = ∑ m ∈ range (k + 1), (k.choose m : ℚ)
          * (if Even (k - m) then (S (k + m) n : ℚ) else 2 * (S (k + m + 1) n : ℚ)) := by
  obtain ⟨k, rfl⟩ : ∃ j, k = j + 1 := ⟨k - 1, by omega⟩
  simp only [Nat.add_sub_cancel]
  induction n with
  | zero =>
    simp only [T, S, zero_add, sum_range_one]
    norm_num
  | succ n ih =>
    have hS : ∀ p, (S p (n + 1) : ℚ) = S p n + ((n : ℚ) + 1) ^ p := by
      intro p; simp [S, sum_range_succ _ (n + 1)]
    have split : ∀ m ∈ range (k + 1 + 1), ((k + 1).choose m : ℚ)
        * (if Even (k + 1 - m) then (S (k + 1 + m) (n + 1) : ℚ)
            else 2 * (S (k + 1 + m + 1) (n + 1) : ℚ))
        = ((k + 1).choose m : ℚ) * (if Even (k + 1 - m) then (S (k + 1 + m) n : ℚ)
            else 2 * (S (k + 1 + m + 1) n : ℚ))
          + ((n : ℚ) + 1) ^ (k + 1) / 2 * (((k + 1).choose m : ℚ)
            * (if Even (k + 1 - m) then 2 * ((n : ℚ) + 1) ^ m
              else 4 * ((n : ℚ) + 1) ^ (m + 1))) := by
      intro m _
      rw [hS, hS]
      split_ifs <;> ring
    rw [sum_congr rfl split, sum_add_distrib, ← ih, ← mul_sum, ← sum_even_binom]
    rw [T_succ_cast, T_cast']
    push_cast
    rw [mul_pow, mul_pow, div_pow]
    field_simp
    ring

/-- The first rows of the even system, solved: `3 S₂ = (2n+1) T` and
`15 S₄ = (2n+1) T (6T − 1)`. -/
theorem S_two (n : ℕ) : 3 * (S 2 n : ℚ) = (2 * n + 1) * T n := by
  have h := T_pow_eq_sum_even 1 n le_rfl
  norm_num [sum_range_succ] at h
  linarith

theorem S_four (n : ℕ) :
    15 * (S 4 n : ℚ) = (2 * n + 1) * T n * (6 * T n - 1) := by
  have h := T_pow_eq_sum_even 2 n (by norm_num)
  norm_num [sum_range_succ] at h
  have h2 := S_two n
  nlinarith

theorem S_nine (n : ℕ) :
    5 * (S 9 n : ℚ) = (T n : ℚ) ^ 2 * (16 * (T n : ℚ) ^ 3 - 20 * (T n : ℚ) ^ 2 + 12 * T n - 3) := by
  have h := T_pow_eq_sum 5 n (by norm_num)
  norm_num [show (range 6).filter (fun m => Odd (5 - m)) = {0, 2, 4} by decide,
    Nat.choose] at h
  linear_combination (-1 : ℚ) * h - (1 / 3 : ℚ) * S_five n - (10 / 3 : ℚ) * S_seven n

theorem S_six (n : ℕ) :
    21 * (S 6 n : ℚ) = (2 * n + 1) * T n * (12 * (T n : ℚ) ^ 2 - 6 * T n + 1) := by
  have h := T_pow_eq_sum_even 3 n (by norm_num)
  norm_num [sum_range_succ] at h
  have h4 := S_four n
  nlinarith

theorem S_eight (n : ℕ) :
    45 * (S 8 n : ℚ)
      = (2 * n + 1) * T n * (40 * (T n : ℚ) ^ 3 - 40 * (T n : ℚ) ^ 2 + 18 * T n - 3) := by
  have h := T_pow_eq_sum_even 4 n (by norm_num)
  norm_num [sum_range_succ, Nat.choose] at h
  linear_combination (-5 : ℚ) * h - (1 / 3 : ℚ) * S_four n - (10 / 3 : ℚ) * S_six n

theorem S_ten (n : ℕ) :
    33 * (S 10 n : ℚ)
      = (2 * n + 1) * T n
          * (48 * (T n : ℚ) ^ 4 - 80 * (T n : ℚ) ^ 3 + 68 * (T n : ℚ) ^ 2 - 30 * T n + 5) := by
  have h := T_pow_eq_sum_even 5 n (by norm_num)
  norm_num [sum_range_succ, Nat.choose] at h
  linear_combination (-3 : ℚ) * h - 2 * S_eight n - S_six n

/-! ## Every even sum is `S₂` times a polynomial in `T` -/

/-- A function of `n` of the form `(2n+1) T_n Q(T_n)`, `Q` a polynomial with rational
coefficients. -/
def IsEvenForm (g : ℕ → ℚ) : Prop :=
  ∃ Q : Polynomial ℚ, ∀ n, g n = (2 * n + 1) * T n * Q.eval (T n : ℚ)

lemma IsEvenForm.add {f g : ℕ → ℚ} (hf : IsEvenForm f) (hg : IsEvenForm g) :
    IsEvenForm (f + g) := by
  obtain ⟨P, hP⟩ := hf
  obtain ⟨Q, hQ⟩ := hg
  exact ⟨P + Q, fun n => by simp [hP, hQ]; ring⟩

lemma IsEvenForm.zero : IsEvenForm 0 := ⟨0, fun n => by simp⟩

lemma IsEvenForm.const_mul {g : ℕ → ℚ} (c : ℚ) (hg : IsEvenForm g) :
    IsEvenForm (fun n => c * g n) := by
  obtain ⟨Q, hQ⟩ := hg
  exact ⟨Polynomial.C c * Q, fun n => by simp [hQ]; ring⟩

lemma IsEvenForm.sub {f g : ℕ → ℚ} (hf : IsEvenForm f) (hg : IsEvenForm g) :
    IsEvenForm (fun n => f n - g n) := by
  obtain ⟨P, hP⟩ := hf
  obtain ⟨Q, hQ⟩ := hg
  exact ⟨P - Q, fun n => by simp [hP, hQ]; ring⟩

lemma IsEvenForm.sum {ι : Type*} (s : Finset ι) (g : ι → ℕ → ℚ)
    (hg : ∀ i ∈ s, IsEvenForm (g i)) : IsEvenForm (fun n => ∑ i ∈ s, g i n) := by
  have : IsEvenForm (∑ i ∈ s, g i) :=
    Finset.sum_induction _ IsEvenForm (fun _ _ => IsEvenForm.add) IsEvenForm.zero hg
  rwa [show (fun n => ∑ i ∈ s, g i n) = ∑ i ∈ s, g i from
    funext fun n => (Finset.sum_apply n s g).symm]

/-- `S_{2k} = (2n+1) T Q_k(T)` for every `k ≥ 1`: strong induction on the even system, whose
terms are all even sums (`k + m` is even when `k − m` is, `k + m + 1` when it is not), the two
top terms making `(2k+1) S_{2k}`. -/
theorem S_even_isEvenForm (k : ℕ) (hk : 1 ≤ k) : IsEvenForm (fun n => (S (2 * k) n : ℚ)) := by
  induction k using Nat.strong_induction_on with
  | _ k ih =>
  obtain ⟨k, rfl⟩ : ∃ j, k = j + 1 := ⟨k - 1, by omega⟩
  -- the row of the even system, its two top terms split off
  set f : ℕ → ℕ → ℚ := fun m n => ((k + 1).choose m : ℚ)
      * (if Even (k + 1 - m) then (S (k + 1 + m) n : ℚ) else 2 * (S (k + 1 + m + 1) n : ℚ))
    with hf
  have hrow : ∀ n, (2 : ℚ) ^ k * (2 * n + 1) * (T n : ℚ) ^ (k + 1)
      = ∑ m ∈ range k, f m n + (2 * k + 3) * (S (2 * (k + 1)) n : ℚ) := fun n => by
    have h := T_pow_eq_sum_even (k + 1) n (by omega)
    rw [Nat.add_sub_cancel] at h
    rw [h, sum_range_succ, sum_range_succ]
    simp only [hf, Nat.sub_self, show k + 1 - k = 1 by omega, Nat.choose_self,
      Nat.choose_succ_self_right]
    rw [ite_eq_left (show Even 0 from ⟨0, rfl⟩), ite_eq_right Nat.not_even_one,
      show k + 1 + (k + 1) = 2 * (k + 1) by ring, show k + 1 + k + 1 = 2 * (k + 1) by ring]
    push_cast; ring
  -- every lower term is an even sum of index `2j`, `1 ≤ j ≤ k`
  have hlow : ∀ m ∈ range k, IsEvenForm (f m) := fun m hm => by
    have hm := mem_range.1 hm
    simp only [hf]
    by_cases he : Even (k + 1 - m)
    · obtain ⟨j, hj⟩ : ∃ j, k + 1 + m = 2 * j := by
        obtain ⟨r, hr⟩ := he; exact ⟨m + r, by omega⟩
      have := (ih j (by omega) (by omega)).const_mul ((k + 1).choose m : ℚ)
      simpa [he, hj] using this
    · obtain ⟨j, hj⟩ : ∃ j, k + 1 + m + 1 = 2 * j := by
        rcases Nat.not_even_iff_odd.1 he with ⟨r, hr⟩; exact ⟨m + r + 1, by omega⟩
      have := ((ih j (by omega) (by omega)).const_mul 2).const_mul ((k + 1).choose m : ℚ)
      simpa [he, hj, mul_assoc] using this
  -- the left side is `(2n+1) T (2^k T^k)`
  have hlhs : IsEvenForm (fun n => (2 : ℚ) ^ k * (2 * n + 1) * (T n : ℚ) ^ (k + 1)) :=
    ⟨Polynomial.C ((2 : ℚ) ^ k) * Polynomial.X ^ k, fun n => by simp; ring⟩
  have key := (hlhs.sub (IsEvenForm.sum (range k) f hlow)).const_mul (1 / (2 * k + 3))
  refine (show (fun n => (S (2 * (k + 1)) n : ℚ)) = _ from funext fun n => ?_) ▸ key
  rw [hrow n]
  have : (2 * (k : ℚ) + 3) ≠ 0 := by positivity
  field_simp
  ring

/-- **Proposition 10.** For every `k ≥ 1` there is a polynomial `R_k` with rational coefficients
such that `S_{2k} = S₂ · R_k(S₁)`. -/
theorem S_even_eq_S_two_mul (k : ℕ) (hk : 1 ≤ k) :
    ∃ R : Polynomial ℚ, ∀ n, (S (2 * k) n : ℚ) = S 2 n * R.eval (T n : ℚ) := by
  obtain ⟨Q, hQ⟩ := S_even_isEvenForm k hk
  refine ⟨Polynomial.C 3 * Q, fun n => ?_⟩
  have h := hQ n
  simp only at h
  rw [h, Polynomial.eval_mul, Polynomial.eval_C]
  linear_combination (-(Q.eval (T n : ℚ))) * S_two n

/-! ## Lagrange's formula is the only one of its kind -/

/-- Levi ben Gershon (1343): `2^p + 1 = 3^q` with `p, q ≥ 1` only for `(1, 1)` and `(3, 2)`. -/
theorem gersonides (p q : ℕ) (hp : 1 ≤ p) (hq : 1 ≤ q) (h : 2 ^ p + 1 = 3 ^ q) :
    (p = 1 ∧ q = 1) ∨ (p = 3 ∧ q = 2) := by
  rcases Nat.lt_or_ge p 2 with hp2 | hp2
  · -- p = 1: 3 = 3^q
    have hp1 : p = 1 := by omega
    subst hp1
    left
    refine ⟨rfl, ?_⟩
    by_contra hne
    have : 3 ^ 2 ≤ 3 ^ q := Nat.pow_le_pow_right (by norm_num) (by omega)
    omega
  · right
    have h4 : 4 ∣ 2 ^ p := by
      have : 2 ^ 2 ∣ 2 ^ p := pow_dvd_pow 2 hp2
      simpa using this
    rcases Nat.even_or_odd' q with ⟨r, rfl | rfl⟩
    · -- q = 2r: 2^p = (3^r − 1)(3^r + 1)
      have hr : 1 ≤ r := by omega
      have h3 : 3 ≤ 3 ^ r := by
        calc 3 = 3 ^ 1 := by norm_num
          _ ≤ 3 ^ r := Nat.pow_le_pow_right (by norm_num) hr
      have hfac : 2 ^ p = (3 ^ r - 1) * (3 ^ r + 1) := by
        have : 3 ^ (2 * r) = 3 ^ r * 3 ^ r := by rw [two_mul, pow_add]
        zify [Nat.one_le_pow r 3 (by norm_num)] at h this ⊢
        nlinarith
      obtain ⟨i, hi, hi'⟩ := (Nat.dvd_prime_pow Nat.prime_two).1 (Dvd.intro _ hfac.symm)
      obtain ⟨j, hj, hj'⟩ := (Nat.dvd_prime_pow Nat.prime_two).1 (Dvd.intro_left _ hfac.symm)
      have hdiff : 2 ^ j = 2 ^ i + 2 := by omega
      -- i = 1, j = 2
      have hi1 : i = 1 := by
        rcases Nat.lt_or_ge i 2 with hi2 | hi2
        · interval_cases i
          · -- 2^j = 3
            have : 2 ^ j % 2 = 1 := by omega
            rcases j with _ | j
            · simp at hdiff
            · rw [pow_succ] at this; omega
          · rfl
        · exfalso
          have a : 4 ∣ 2 ^ i := by
            have : 2 ^ 2 ∣ 2 ^ i := pow_dvd_pow 2 hi2
            simpa using this
          have hj2 : 2 ≤ j := by
            by_contra hj2
            interval_cases j <;> [omega; (have : 4 ≤ 2 ^ i := Nat.le_of_dvd (by positivity) a; omega)]
          have b : 4 ∣ 2 ^ j := by
            have : 2 ^ 2 ∣ 2 ^ j := pow_dvd_pow 2 hj2
            simpa using this
          omega
      subst hi1
      have hr1 : 3 ^ r = 3 := by omega
      have hr1' : r = 1 := by
        by_contra hne
        have : 3 ^ 2 ≤ 3 ^ r := Nat.pow_le_pow_right (by norm_num) (by omega)
        omega
      subst hr1'
      refine ⟨?_, rfl⟩
      have h8 : 2 ^ p = 2 ^ 3 := by norm_num at h; omega
      exact Nat.pow_right_injective le_rfl h8
    · -- q = 2r + 1: 3^q ≡ 3 mod 4, but 2^p + 1 ≡ 1
      exfalso
      have : 3 ^ (2 * r + 1) % 4 = 3 := by
        rw [pow_succ, pow_mul, Nat.mul_mod, Nat.pow_mod]
        norm_num
      omega

/-- If `S_p = T^q` for every `n`, with `p, q ≥ 1`, then `(p, q) = (1, 1)` or `(3, 2)`:
`n = 2` gives `1 + 2^p = 3^q`. Both cases occur (`S_one`, `S_three`). -/
theorem lagrange_unique (p q : ℕ) (hp : 1 ≤ p) (hq : 1 ≤ q) (h : ∀ n, S p n = T n ^ q) :
    (p = 1 ∧ q = 1) ∨ (p = 3 ∧ q = 2) := by
  have h2 := h 2
  have hS : S p 2 = 2 ^ p + 1 := by
    simp [S, sum_range_succ, zero_pow (by omega : p ≠ 0)]
    ring
  have hT : T 2 = 3 := by decide
  rw [hS, hT] at h2
  exact gersonides p q hp hq h2

end Germain.Naf4073
