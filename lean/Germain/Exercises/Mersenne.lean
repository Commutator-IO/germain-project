import Mathlib

/-!
# The Marin Mersenne chapter of the exercise book

`exercises/exercices.fr.tex`, section « Marin Mersenne (1588--1648) ».

* « Aucun triangle rectangle en nombres n'a pour aire un carré » (naf-5176, view 32):
  `not_fourth_sub_fourth` (`X⁴ − Y⁴ = Z²` has no solution with `XYZ ≠ 0`), `no_square_area`
  (Fermat's right-triangle theorem), `no_fourth_sum_fourth` (`X⁴ + Y⁴ = W⁴`), and the identities
  of questions 3 and 4, `descent_identities` and `triangle_of_fourth_powers`.

  The proof here descends on `X⁴ − Y⁴ = Z²` (strong induction on `|X|`, with mathlib's
  classification of primitive Pythagorean triples), not on the triangles as the book does;
  questions 1 and 2 (the reduction to a primitive triangle and the four squares
  `m, n, m + n, m − n`) are the book's route and are not proved step by step. What is proved is
  the conclusion of question 3 and all of question 4.

Not formalised in this chapter: numerical values (π, the polygon of 97 sides, latitudes, commas),
music and the games of NAF 5176, the trochoids and the solid of revolution (analysis).
-/

namespace Germain.Exercises.Mersenne

/-! ## « Aucun triangle rectangle en nombres n'a pour aire un carré » -/

/-- **Aucun triangle rectangle en nombres**, question 3. With `u² = m + n`, `v² = m − n`,
`r = (u + v)/2`, `s = (u − v)/2`: `r² + s² = m` and `2rs = n`. -/
theorem descent_identities (m n u v : ℚ) (hu : u ^ 2 = m + n) (hv : v ^ 2 = m - n) :
    ((u + v) / 2) ^ 2 + ((u - v) / 2) ^ 2 = m ∧ 2 * ((u + v) / 2) * ((u - v) / 2) = n := by
  constructor
  · linear_combination hu / 2 + hv / 2
  · linear_combination hu / 2 - hv / 2

/-- **Aucun triangle rectangle en nombres**, question 4. `(X⁴ − Y⁴, 2X²Y², X⁴ + Y⁴)` is a right
triangle of area `X²Y²(X⁴ − Y⁴)`. -/
theorem triangle_of_fourth_powers (X Y : ℤ) :
    (X ^ 4 - Y ^ 4) ^ 2 + (2 * X ^ 2 * Y ^ 2) ^ 2 = (X ^ 4 + Y ^ 4) ^ 2 ∧
    (X ^ 4 - Y ^ 4) * (2 * X ^ 2 * Y ^ 2) = 2 * (X ^ 2 * Y ^ 2 * (X ^ 4 - Y ^ 4)) := by
  constructor <;> ring

/-- Two coprime integers whose product is a nonzero square, the first positive, are both squares
up to the sign of the second, which is then positive too. -/
private theorem sq_and_sq {a b c : ℤ} (hab : Int.gcd a b = 1) (h : a * b = c ^ 2) (ha : 0 < a)
    (hc : c ≠ 0) : (∃ i, a = i ^ 2) ∧ ∃ j, b = j ^ 2 := by
  obtain ⟨i, hi⟩ := Int.sq_of_gcd_eq_one hab h
  have hb : 0 < b := by
    have : 0 < a * b := by rw [h]; positivity
    exact pos_of_mul_pos_right this ha.le
  rw [mul_comm] at h
  obtain ⟨j, hj⟩ := Int.sq_of_gcd_eq_one (by rwa [Int.gcd_comm]) h
  refine ⟨⟨i, ?_⟩, ⟨j, ?_⟩⟩
  · rcases hi with hi | hi
    · exact hi
    · nlinarith [sq_nonneg i]
  · rcases hj with hj | hj
    · exact hj
    · nlinarith [sq_nonneg j]

/-- `r² − s²` and `rs` are coprime when `r` and `s` are. -/
private theorem isCoprime_sq_sub {r s : ℤ} (h : IsCoprime r s) : IsCoprime (r ^ 2 - s ^ 2) (r * s) := by
  apply IsCoprime.mul_right
  · have : IsCoprime (-s ^ 2) r := (h.symm.pow_left (m := 2)).neg_left
    have := this.add_mul_left_left r
    rwa [show -s ^ 2 + r * r = r ^ 2 - s ^ 2 by ring] at this
  · have : IsCoprime (r ^ 2) s := h.pow_left
    have := this.add_mul_left_left (-s)
    rwa [show r ^ 2 + s * -s = r ^ 2 - s ^ 2 by ring] at this

/-- The even half of the descent. If `u > 0` is odd, `u² + v² = x²` is primitive, `x > 0`, and
`y² = 2uv` with `y ≠ 0`, then there is a smaller solution of `j⁴ − k⁴ = i²`. -/
private theorem descent_even {u v x y : ℤ} (hu : 0 < u) (hu2 : u % 2 = 1) (hx : 0 < x)
    (huv : Int.gcd u v = 1) (hpyth : u ^ 2 + v ^ 2 = x ^ 2) (hy : y ≠ 0) (hy2 : y ^ 2 = 2 * u * v) :
    ∃ i j k : ℤ, i ≠ 0 ∧ j ≠ 0 ∧ k ≠ 0 ∧ j ^ 4 - k ^ 4 = i ^ 2 ∧ j ^ 2 < x ^ 2 := by
  have ht : PythagoreanTriple u v x := by unfold PythagoreanTriple; linear_combination hpyth
  obtain ⟨r, s, hr1, hr2, hr3, hr4, -, hr6⟩ := ht.coprime_classification' huv hu2 hx
  -- `y² = 4urs`, so `(y/2)² = u (rs)`
  have hy2' : 2 ∣ y := by
    have he : Even (y ^ 2) := even_iff_two_dvd.2 ⟨2 * u * r * s, by rw [hy2, hr2]; ring⟩
    exact even_iff_two_dvd.1 ((Int.even_pow' two_ne_zero).1 he)
  obtain ⟨y', rfl⟩ := hy2'
  have hy' : y' ≠ 0 := by rintro rfl; simp at hy
  have hprod : u * (r * s) = y' ^ 2 := by
    have : 4 * (u * (r * s)) = 4 * y' ^ 2 := by linear_combination -hy2 - 2 * u * hr2
    linarith
  have hrs : r * s ≠ 0 := by
    intro h0; rw [h0, mul_zero] at hprod; exact hy' (pow_eq_zero_iff two_ne_zero |>.1 hprod.symm)
  have hr0 : 0 < r := lt_of_le_of_ne hr6 (fun h => hrs (by rw [← h, zero_mul]))
  have hcop : Int.gcd u (r * s) = 1 := by
    rw [hr1]
    exact Int.isCoprime_iff_gcd_eq_one.1 (isCoprime_sq_sub (Int.isCoprime_iff_gcd_eq_one.2 hr4))
  obtain ⟨⟨i, hi⟩, ⟨d, hd⟩⟩ := sq_and_sq hcop hprod hu hy'
  have hd0 : d ≠ 0 := by rintro rfl; rw [zero_pow two_ne_zero] at hd; exact hrs hd
  obtain ⟨⟨j, hj⟩, ⟨k, hk⟩⟩ := sq_and_sq hr4 hd hr0 hd0
  refine ⟨i, j, k, ?_, ?_, ?_, ?_, ?_⟩
  · rintro rfl; simp at hi; omega
  · rintro rfl; simp at hj; omega
  · rintro rfl; simp at hk; rw [hk, mul_zero] at hrs; exact hrs rfl
  · rw [← hi, hr1, hj, hk]; ring
  · -- `j² = r ≤ r² < r² + s² = x ≤ x²`
    have hs0 : s ≠ 0 := fun h => hrs (by rw [h, mul_zero])
    have h1 : r ≤ r ^ 2 := by nlinarith
    have h2 : r ^ 2 < x := by rw [hr3]; have := pow_pos (abs_pos.2 hs0) 2; nlinarith [sq_abs s]
    have h3 : x ≤ x ^ 2 := by nlinarith
    rw [← hj]; linarith

/-- The odd half of the descent. If `(y², z, x²)` is a primitive triple with `y` odd, then
`m⁴ − n⁴ = (xy)²` for the `m, n` of the classification, a smaller solution. -/
private theorem descent_odd {x y z : ℤ} (hx : 0 < x) (hz : z ≠ 0) (hy2 : y ^ 2 % 2 = 1)
    (hyz : Int.gcd (y ^ 2) z = 1) (h : y ^ 4 + z ^ 2 = x ^ 4) :
    ∃ i j k : ℤ, i ≠ 0 ∧ j ≠ 0 ∧ k ≠ 0 ∧ j ^ 4 - k ^ 4 = i ^ 2 ∧ j ^ 2 < x ^ 2 := by
  have ht : PythagoreanTriple (y ^ 2) z (x ^ 2) := by
    unfold PythagoreanTriple; linear_combination h
  obtain ⟨m, n, h1, h2, h3, -, -, -⟩ := ht.coprime_classification' hyz hy2 (by positivity)
  have hn : n ≠ 0 := by rintro rfl; simp at h2; exact hz h2
  have hy : y ≠ 0 := by rintro rfl; simp at hy2
  have hm : m ≠ 0 := by
    rintro rfl
    have : 0 < y ^ 2 := by positivity
    nlinarith [sq_nonneg n]
  refine ⟨x * y, m, n, mul_ne_zero hx.ne' hy, hm, hn, ?_, ?_⟩
  · have : m ^ 4 - n ^ 4 = (m ^ 2 - n ^ 2) * (m ^ 2 + n ^ 2) := by ring
    rw [this, ← h1, ← h3]; ring
  · rw [h3]; have := pow_pos (abs_pos.2 hn) 2; nlinarith [sq_abs n]

/-- One step of the descent, for `x > 0` and `x, y` coprime. -/
private theorem descent_step {x y z : ℤ} (hx : 0 < x) (hy : y ≠ 0) (hz : z ≠ 0)
    (hxy : Int.gcd x y = 1) (h : x ^ 4 - y ^ 4 = z ^ 2) :
    ∃ i j k : ℤ, i ≠ 0 ∧ j ≠ 0 ∧ k ≠ 0 ∧ j ^ 4 - k ^ 4 = i ^ 2 ∧ j ^ 2 < x ^ 2 := by
  have hc : IsCoprime x y := Int.isCoprime_iff_gcd_eq_one.2 hxy
  -- `y²` and `z` are coprime: `z² = x⁴ + y² (−y²)`
  have hyz : IsCoprime (y ^ 2) z := by
    have h1 : IsCoprime (y ^ 2) (x ^ 4) := hc.symm.pow
    have h2 := h1.add_mul_left_right (-y ^ 2)
    rw [show x ^ 4 + y ^ 2 * -y ^ 2 = z * z by linear_combination h] at h2
    exact h2.of_mul_right_left
  rcases Int.emod_two_eq_zero_or_one y with hy0 | hy1
  · -- `y` even: `x` odd, `z` odd, and `(z, y², x²)` is primitive
    have hx1 : x % 2 = 1 := by
      rcases Int.emod_two_eq_zero_or_one x with hx0 | hx1
      · exfalso
        have : (2 : ℤ) ∣ (Int.gcd x y : ℤ) :=
          Int.dvd_coe_gcd (Int.dvd_of_emod_eq_zero hx0) (Int.dvd_of_emod_eq_zero hy0)
        rw [hxy] at this; norm_num at this
      · exact hx1
    have hz1 : z % 2 = 1 := by
      have hxo : Odd x := Int.odd_iff.2 hx1
      have hye : Even y := Int.even_iff.2 hy0
      have : Odd (z ^ 2) := by rw [← h]; exact (hxo.pow).sub_even (hye.pow_of_ne_zero (by norm_num))
      exact Int.odd_iff.1 ((Int.odd_pow' two_ne_zero).1 this)
    have ht : PythagoreanTriple z (y ^ 2) (x ^ 2) := by
      unfold PythagoreanTriple; linear_combination -h
    obtain ⟨m, n, -, h2, h3, h4, h5, h6⟩ :=
      ht.coprime_classification' (Int.isCoprime_iff_gcd_eq_one.1 hyz.symm) hz1 (by positivity)
    have hy2 : 0 < y ^ 2 := by positivity
    have hm : 0 < m := lt_of_le_of_ne h6 (by rintro rfl; simp at h2; omega)
    have hn : 0 < n := by
      have : 0 < m * n := by nlinarith
      exact pos_of_mul_pos_right this hm.le
    rcases h5 with ⟨-, hn1⟩ | ⟨hm1, -⟩
    · exact descent_even hn hn1 hx (by rwa [Int.gcd_comm]) (by linear_combination -h3) hy
        (by linear_combination h2)
    · exact descent_even hm hm1 hx h4 (by linear_combination -h3) hy h2
  · exact descent_odd hx hz (by rw [sq, Int.mul_emod, hy1]; decide)
      (Int.isCoprime_iff_gcd_eq_one.1 hyz) (by linear_combination -h)

/-- **Aucun triangle rectangle en nombres**, question 4. `X⁴ − Y⁴ = Z²` has no solution in integers
with `XYZ ≠ 0`. -/
theorem not_fourth_sub_fourth {x y z : ℤ} (hx : x ≠ 0) (hy : y ≠ 0) (hz : z ≠ 0) :
    x ^ 4 - y ^ 4 ≠ z ^ 2 := by
  suffices H : ∀ N : ℕ, ∀ x y z : ℤ, x.natAbs = N → x ≠ 0 → y ≠ 0 → z ≠ 0 →
      x ^ 4 - y ^ 4 ≠ z ^ 2 from H _ x y z rfl hx hy hz
  intro N
  induction N using Nat.strong_induction_on with
  | _ N ih =>
  intro x y z hN hx hy hz h
  -- divide by `g = gcd x y`: `x = x'g`, `y = y'g`, and `g² ∣ z`
  obtain ⟨g, x', y', hg, hxy', rfl, rfl⟩ := Int.exists_gcd_one' (Int.gcd_pos_of_ne_zero_left y hx)
  have hg0 : (g : ℤ) ≠ 0 := by exact_mod_cast hg.ne'
  have hdvd : (g : ℤ) ^ 2 ∣ z := by
    rw [← Int.pow_dvd_pow_iff two_ne_zero]
    exact ⟨x' ^ 4 - y' ^ 4, by rw [← h]; ring⟩
  obtain ⟨z', rfl⟩ := hdvd
  have hx' : x' ≠ 0 := by rintro rfl; simp at hx
  have hy' : y' ≠ 0 := by rintro rfl; simp at hy
  have hz' : z' ≠ 0 := by rintro rfl; simp at hz
  have h' : x' ^ 4 - y' ^ 4 = z' ^ 2 := by
    apply mul_left_cancel₀ (pow_ne_zero 4 hg0); linear_combination h
  -- make `x'` positive
  have h'' : |x'| ^ 4 - y' ^ 4 = z' ^ 2 := by
    rw [show |x'| ^ 4 = (|x'| ^ 2) ^ 2 by ring, sq_abs]; linear_combination h'
  have hgcd : Int.gcd |x'| y' = 1 := by rwa [Int.gcd_eq_natAbs, Int.natAbs_abs, ← Int.gcd_eq_natAbs]
  obtain ⟨i, j, k, hi, hj, hk, hjk, hlt⟩ := descent_step (abs_pos.2 hx') hy' hz' hgcd h''
  apply ih j.natAbs _ j k i rfl hj hk hi hjk
  -- `|j| < |x'| ≤ |x' g| = N`
  rw [sq_abs] at hlt
  have h1 : j.natAbs < x'.natAbs := Int.natAbs_lt_iff_sq_lt.2 hlt
  have h2 : x'.natAbs ≤ (x' * g).natAbs := by
    rw [Int.natAbs_mul]; exact Nat.le_mul_of_pos_right _ (by simpa using hg)
  omega

/-- **Aucun triangle rectangle en nombres**, question 4. `X⁴ + Y⁴ = W⁴` has no solution with
`XYW ≠ 0`: `W⁴ − Y⁴ = (X²)²`. -/
theorem no_fourth_sum_fourth {x y w : ℤ} (hx : x ≠ 0) (hy : y ≠ 0) (hw : w ≠ 0) :
    x ^ 4 + y ^ 4 ≠ w ^ 4 := by
  intro h
  exact not_fourth_sub_fourth hw hy (pow_ne_zero 2 hx) (by linear_combination -h)

/-- `c² = 2a²` has no solution with `a ≠ 0`: `√2` is irrational. -/
private theorem sq_ne_two_mul_sq {a c : ℤ} (ha : a ≠ 0) : c ^ 2 ≠ 2 * a ^ 2 := by
  intro h
  have h' : (c : ℚ) ^ 2 = 2 * (a : ℚ) ^ 2 := by exact_mod_cast h
  have ha' : (a : ℚ) ≠ 0 := by exact_mod_cast ha
  have hq : ((c / a : ℚ)) ^ 2 = 2 := by
    rw [div_pow]; field_simp; linear_combination h'
  have hr : (((|c / a| : ℚ)) : ℝ) = Real.sqrt 2 := by
    rw [eq_comm, Real.sqrt_eq_iff_mul_self_eq (by norm_num) (by positivity)]
    push_cast
    rw [abs_mul_abs_self, ← sq]; exact_mod_cast hq.symm
  exact irrational_sqrt_two.ne_rat _ hr.symm

/-- **Aucun triangle rectangle en nombres n'a pour aire un carré** (Fermat's right-triangle
theorem). There is no right triangle in positive integers `a² + b² = c²` whose area `ab/2` is a
square `k²`. The book's reduction: `(a² − b²)² = c⁴ − (2k)⁴`. -/
theorem no_square_area {a b c k : ℤ} (ha : 0 < a) (hb : 0 < b) (hpyth : a ^ 2 + b ^ 2 = c ^ 2)
    (harea : a * b = 2 * k ^ 2) : False := by
  have hk : k ≠ 0 := by rintro rfl; simp at harea; omega
  have hc : c ≠ 0 := by rintro rfl; nlinarith
  rcases eq_or_ne a b with rfl | hab
  · -- an isosceles right triangle would make `√2` rational
    exact sq_ne_two_mul_sq ha.ne' (c := c) (by linear_combination -hpyth)
  · have hab2 : a ^ 2 - b ^ 2 ≠ 0 := by
      intro h0
      have : (a - b) * (a + b) = 0 := by linear_combination h0
      rcases mul_eq_zero.1 this with h1 | h1
      · exact hab (by linarith)
      · linarith
    apply not_fourth_sub_fourth hc (mul_ne_zero two_ne_zero hk) hab2
    have : c ^ 4 = (a ^ 2 + b ^ 2) ^ 2 := by rw [hpyth]; ring
    rw [this]
    linear_combination (4 * a * b + 8 * k ^ 2) * harea

end Germain.Exercises.Mersenne
