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

* « L'aire et la tangente des trochoïdes » (nal-2338, views 3–4): `trochoid_x_monotone`,
  `trochoid_area`, `trochoid_ratios`, `trochoid_tangent`, `cycloid_tangent_top`,
  `trochoid_prolate`. The change of variable from the area under a graph to the parametric
  integral, the homothety of question 3 and the loop of question 5 are not formalised.
* « Le solide autour de l'axe : 11 à 18, 16 à 11, une seule erreur » (nal-2338, views 4–5,
  16–19): `cycloid_area`, `cycloid_moment`, `cycloid_ratios`, `solid_integral`, `solid_ratio`,
  `solid_centre`, `solid_ineffable`, `solid_archimedes`. Pappus–Guldin and the slicing of the solid
  into cylinders are taken as the exercise takes them; the irrationality of `π²` is a hypothesis.

* « Trois valeurs de π et un polygone de 97 côtés » (fr-12357, views 8–9): `fabre_rule`,
  `cornu_rule`, `circumscribed_gt`, `pi_values`. `97 tan(π/97)` is not computed.
* « Les chants de huit notes sans septième ni sixte » (fr-12357, view 21): `songs`.
* « Cinquante-trois commas, douze demi-tons et les fractions continues » (fr-12357, views 5, 43):
  `commas`, `fifth_convergents`, `thirds`, `tempered_identities`, with `lt_mul_logb`,
  `mul_logb_lt`, `nearest_comma`: every comparison of a logarithm is reduced to one of integers.
* « La latitude de Paris par l'étoile polaire et par le Soleil » (naf-9544, views 38–39):
  `latitude`.
* « Le partage des enjeux » and « La formule générale des partis » (naf-5176, views 40–41):
  `stakes`, `three_players`, `fair_game`.
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


/-! ## « L'aire et la tangente des trochoïdes » -/

section Trochoid

open Real intervalIntegral

/-- `∫ cos² = (t + sin t cos t)/2`: the derivative used below. -/
private theorem hasDerivAt_cos_sq_prim (t : ℝ) :
    HasDerivAt (fun t => (t + sin t * cos t) / 2) (cos t ^ 2) t := by
  have h := ((hasDerivAt_id t).add ((hasDerivAt_sin t).mul (hasDerivAt_cos t))).div_const 2
  refine h.congr_deriv ?_
  linear_combination (-1 / 2) * sin_sq_add_cos_sq t

/-- **Les trochoïdes**, question 1. For `d ≤ r`, `x(t) = rt − d sin t` is monotone. -/
theorem trochoid_x_monotone (r d : ℝ) (hdr : d ≤ r) (hd : 0 ≤ d) :
    Monotone (fun t : ℝ => r * t - d * sin t) := by
  have hder : ∀ t, HasDerivAt (fun t : ℝ => r * t - d * sin t) (r - d * cos t) t := fun t => by
    have := ((hasDerivAt_id t).const_mul r).sub ((hasDerivAt_sin t).const_mul d)
    exact this.congr_deriv (by ring)
  apply monotone_of_deriv_nonneg (fun t => (hder t).differentiableAt)
  intro t
  rw [(hder t).deriv]
  nlinarith [cos_le_one t, mul_le_mul_of_nonneg_left (cos_le_one t) hd]

/-- **Les trochoïdes**, question 1. The area `∫₀^{2π} (y − (r − d)) x' dt = 2πrd + πd²`, with
`y − (r − d) = d(1 − cos t)` and `x' = r − d cos t`. (The integral is computed for every `d`;
that it is the area of a region under a graph needs `x` monotone, question 5.) -/
theorem trochoid_area (r d : ℝ) :
    ∫ t in (0)..(2 * π), d * (1 - cos t) * (r - d * cos t) = 2 * π * r * d + π * d ^ 2 := by
  have hF : ∀ t, HasDerivAt (fun t => d * (r * t - (r + d) * sin t + d * ((t + sin t * cos t) / 2)))
      (d * (1 - cos t) * (r - d * cos t)) t := fun t => by
    have h := ((((hasDerivAt_id t).const_mul r).sub ((hasDerivAt_sin t).const_mul (r + d))).add
      ((hasDerivAt_cos_sq_prim t).const_mul d)).const_mul d
    exact h.congr_deriv (by ring)
  rw [integral_eq_sub_of_hasDerivAt (fun t _ => hF t) (by
    apply Continuous.intervalIntegrable; fun_prop)]
  simp only [sin_two_pi, cos_two_pi, sin_zero, cos_zero]
  ring

/-- **Les trochoïdes**, question 2. Base `2πr`, generating circumference `2πd`, height `2d`,
triangle `τ = 2πrd`: `A/τ = (C + 2B)/(2B) = (2d + 2·2r)/(2·2r)`, `A − τ = πd²` (the generating
circle), `A : (A − τ) = (C + 2B) : C`; for `d = r`, `A = 3πr²`. -/
theorem trochoid_ratios (r d : ℝ) (hr : 0 < r) (hd : 0 < d) :
    let A := 2 * π * r * d + π * d ^ 2
    let τ := (1 / 2) * (2 * π * r) * (2 * d)
    let B := 2 * π * r
    let C := 2 * π * d
    A / τ = (C + 2 * B) / (2 * B) ∧ A / τ = (2 * d + 2 * (2 * r)) / (2 * (2 * r)) ∧
    A - τ = π * d ^ 2 ∧ A / (A - τ) = (C + 2 * B) / C ∧
    (2 * π * r * r + π * r ^ 2 = 3 * π * r ^ 2) := by
  intro A τ B C
  have hπ : 0 < π := pi_pos
  have hd0 : d ≠ 0 := hd.ne'
  have hAτ : A - τ = π * d ^ 2 := by simp only [A, τ]; ring
  refine ⟨?_, ?_, hAτ, ?_, by ring⟩
  · simp only [A, τ, B, C]; field_simp; ring
  · simp only [A, τ]; field_simp; ring
  · rw [hAτ]; simp only [A, B, C]; field_simp; ring

/-- **Les trochoïdes**, question 3. The velocity is the centre's velocity plus the rotation's:
`(x', y') = r(1, 0) + d u` with `u = (−cos t, sin t)`, which directs the tangent at `P` to the
circle of centre `Ω` and radius `d`. If `T = P + λu` and `S = T + λ(r/d)(1, 0)`, then
`PS = (λ/d)(x', y')`: `SP` is the tangent, and `PT : TS = d : r`. -/
theorem trochoid_tangent (r d t lam : ℝ) (hd : d ≠ 0) :
    (r - d * cos t = r * 1 + d * (-cos t) ∧ d * sin t = r * 0 + d * sin t) ∧
    (lam * (-cos t) + lam * (r / d) * 1 = lam / d * (r - d * cos t) ∧
      lam * sin t + lam * (r / d) * 0 = lam / d * (d * sin t)) := by
  refine ⟨⟨by ring, by ring⟩, ?_, ?_⟩ <;> field_simp <;> ring

/-- **Les trochoïdes**, question 4. For the primary cycloid, `PH = r(sin t, 1 + cos t)` and the
velocity `r(1 − cos t, sin t)` are collinear: the tangent passes through the top `H` of the
rolling circle. -/
theorem cycloid_tangent_top (r t : ℝ) :
    (r * sin t) * (r * sin t) - (r * (1 + cos t)) * (r * (1 - cos t)) = 0 := by
  linear_combination r ^ 2 * sin_sq_add_cos_sq t

/-- **Les trochoïdes**, question 5. For `d > r`, `x'(0) = r − d < 0`, and `x(−t) = −x(t)`,
`y(−t) = y(t)`: the arch before passes through the same points, and the curve loops. -/
theorem trochoid_prolate (r d t : ℝ) (hdr : r < d) :
    r - d * cos 0 < 0 ∧ r * (-t) - d * sin (-t) = -(r * t - d * sin t) ∧
    r - d * cos (-t) = r - d * cos t := by
  refine ⟨by rw [cos_zero]; linarith, by rw [sin_neg]; ring, by rw [cos_neg]⟩

end Trochoid

/-! ## « Le solide autour de l'axe : 11 à 18, 16 à 11, une seule erreur » -/

section Solid

open Real intervalIntegral

/-- **Le solide autour de l'axe**, question 1. The area of the cycloid,
`∫₀^{2π} y x' dt = r² ∫ (1 − cos t)² = 3πr²`. -/
theorem cycloid_area (r : ℝ) :
    ∫ t in (0)..(2 * π), r * (1 - cos t) * (r * (1 - cos t)) = 3 * π * r ^ 2 := by
  have hF : ∀ t, HasDerivAt (fun t => r ^ 2 * (t - 2 * sin t + (t + sin t * cos t) / 2))
      (r * (1 - cos t) * (r * (1 - cos t))) t := fun t => by
    have h := (((hasDerivAt_id t).sub ((hasDerivAt_sin t).const_mul 2)).add
      (hasDerivAt_cos_sq_prim t)).const_mul (r ^ 2)
    exact h.congr_deriv (by ring)
  rw [integral_eq_sub_of_hasDerivAt (fun t _ => hF t) (by
    apply Continuous.intervalIntegrable; fun_prop)]
  simp only [sin_two_pi, cos_two_pi, sin_zero, cos_zero]
  ring

/-- **Le solide autour de l'axe**, question 1. The moment about the base,
`∫₀^{2π} (y²/2) x' dt = (r³/2) ∫ (1 − cos t)³ = 5πr³/2`. -/
theorem cycloid_moment (r : ℝ) :
    ∫ t in (0)..(2 * π), (r * (1 - cos t)) ^ 2 / 2 * (r * (1 - cos t)) = 5 * π * r ^ 3 / 2 := by
  have hF : ∀ t, HasDerivAt
      (fun t => r ^ 3 / 2 * (t - 3 * sin t + 3 * ((t + sin t * cos t) / 2) - (sin t - sin t ^ 3 / 3)))
      ((r * (1 - cos t)) ^ 2 / 2 * (r * (1 - cos t))) t := fun t => by
    have h := ((((hasDerivAt_id t).sub ((hasDerivAt_sin t).const_mul 3)).add
      ((hasDerivAt_cos_sq_prim t).const_mul 3)).sub ((hasDerivAt_sin t).sub
        (((hasDerivAt_sin t).pow 3).div_const 3))).const_mul (r ^ 3 / 2)
    refine h.congr_deriv ?_
    push_cast
    linear_combination (r ^ 3 / 2 * cos t) * sin_sq_add_cos_sq t
  rw [integral_eq_sub_of_hasDerivAt (fun t _ => hF t) (by
    apply Continuous.intervalIntegrable; fun_prop)]
  simp only [sin_two_pi, cos_two_pi, sin_zero, cos_zero]
  ring

/-- **Le solide autour de l'axe**, question 1. `ȳ = (5πr³/2)/(3πr²) = 5r/6`: the centre divides
the axis `2r` as `7 : 5`; Pappus–Guldin about the base gives `2π · 5r/6 · 3πr² = 5π²r³`, against
the cylinder `8π²r³`: `5 : 8`. -/
theorem cycloid_ratios (r : ℝ) (hr : 0 < r) :
    (5 * π * r ^ 3 / 2) / (3 * π * r ^ 2) = 5 * r / 6 ∧ (2 * r - 5 * r / 6) / (5 * r / 6) = 7 / 5 ∧
    2 * π * (5 * r / 6) * (3 * π * r ^ 2) = 5 * π ^ 2 * r ^ 3 ∧
    π * (2 * r) ^ 2 * (2 * π * r) = 8 * π ^ 2 * r ^ 3 := by
  have hπ : 0 < π := pi_pos
  refine ⟨by field_simp; ring, by field_simp; ring, by ring, by ring⟩

/-- **Le solide autour de l'axe**, question 2. `∫₀^π (π − t + sin t)(1 − cos t)² dt = 3π²/4 − 4/3`,
so `V = 2πr³(3π²/4 − 4/3) = πr³(9π² − 16)/6`. -/
theorem solid_integral :
    ∫ t in (0)..π, (π - t + sin t) * (1 - cos t) ^ 2 = 3 * π ^ 2 / 4 - 4 / 3 := by
  have hF : ∀ t, HasDerivAt
      (fun t => (π * t - t ^ 2 / 2) - 2 * ((π - t) * sin t - cos t) +
        (π - t) * (t + sin t * cos t) / 2 + t ^ 2 / 4 + sin t ^ 2 / 4 + (1 - cos t) ^ 3 / 3)
      ((π - t + sin t) * (1 - cos t) ^ 2) t := fun t => by
    have h1 := ((hasDerivAt_id t).const_mul π).sub (((hasDerivAt_id t).pow 2).div_const 2)
    have h2 := ((((hasDerivAt_id t).const_sub π).mul (hasDerivAt_sin t)).sub
      (hasDerivAt_cos t)).const_mul 2
    have h3 := (((hasDerivAt_id t).const_sub π).mul ((hasDerivAt_id t).add
      ((hasDerivAt_sin t).mul (hasDerivAt_cos t)))).div_const 2
    have h4 := ((hasDerivAt_id t).pow 2).div_const 4
    have h5 := ((hasDerivAt_sin t).pow 2).div_const 4
    have h6 := (((hasDerivAt_cos t).const_sub 1).pow 3).div_const 3
    have h := ((((h1.sub h2).add h3).add h4).add h5).add h6
    refine h.congr_deriv ?_
    simp only [id_eq, Pi.add_apply, Pi.mul_apply]
    push_cast
    linear_combination (-(π - t) / 2) * sin_sq_add_cos_sq t
  rw [integral_eq_sub_of_hasDerivAt (fun t _ => hF t) (by
    apply Continuous.intervalIntegrable; fun_prop)]
  simp only [sin_pi, cos_pi, sin_zero, cos_zero]
  ring

/-- **Le solide autour de l'axe**, question 2. The ratio to the cylinder `2π³r³` is
`(9π² − 16)/(12π²) = 3/4 − 4/(3π²)`; it is not `11/18`, and, `π²` being irrational (admitted, as
in the exercise), it is not rational. -/
theorem solid_ratio (r : ℝ) (hr : 0 < r) (hirr : Irrational (π ^ 2)) :
    (π * r ^ 3 * (9 * π ^ 2 - 16) / 6) / (2 * π ^ 3 * r ^ 3) = 3 / 4 - 4 / (3 * π ^ 2) ∧
    3 / 4 - 4 / (3 * π ^ 2) ≠ 11 / 18 ∧ ∀ q : ℚ, 3 / 4 - 4 / (3 * π ^ 2) ≠ q := by
  have hπ : 0 < π := pi_pos
  have hπ2 : (0 : ℝ) < 3 * π ^ 2 := by positivity
  refine ⟨by field_simp; ring, fun h => ?_, fun q h => ?_⟩
  · -- `11/18` would make `π² = 48/5` rational
    have e : 4 / (3 * π ^ 2) = 5 / 36 := by linarith
    rw [div_eq_iff hπ2.ne'] at e
    have : π ^ 2 = ((48 / 5 : ℚ) : ℝ) := by push_cast; linear_combination (-12 / 5) * e
    exact hirr ⟨48 / 5, this.symm⟩
  · have e : 4 / (3 * π ^ 2) = 3 / 4 - q := by linarith
    have hq : (3 : ℝ) / 4 - q ≠ 0 := by
      intro hq; rw [hq] at e
      have : (0 : ℝ) < 4 / (3 * π ^ 2) := by positivity
      linarith
    rw [div_eq_iff hπ2.ne'] at e
    have : π ^ 2 = ((4 / (3 * (3 / 4 - q)) : ℚ) : ℝ) := by
      push_cast
      rw [eq_div_iff (mul_ne_zero three_ne_zero hq)]
      linear_combination -e
    exact hirr ⟨_, this.symm⟩

/-- **Le solide autour de l'axe**, question 3. `16 : 11` and `19 : 8` give the same
`δ = (11/27)πr`, and Pappus–Guldin with this `δ` gives exactly `11/18`; the true `δ` is
`(π/2 − 8/(9π)) r`, and the true ratios are `(9π² + 16) : (9π² − 16)` and
`(27π² − 16) : (9π² + 16)`. -/
theorem solid_centre (r : ℝ) (hr : 0 < r) :
    let δ := 11 / 27 * π * r
    π * r - 16 / 27 * π * r = δ ∧ (2 * π * r) * 19 / 27 = 38 / 27 * π * r ∧
    (2 * π * δ * (3 / 2 * π * r ^ 2)) / (2 * π ^ 3 * r ^ 3) = 11 / 18 ∧
    (π * r ^ 3 * (9 * π ^ 2 - 16) / 6) / (3 * π ^ 2 * r ^ 2) = (π / 2 - 8 / (9 * π)) * r ∧
    (π * r - (π / 2 - 8 / (9 * π)) * r) / ((π / 2 - 8 / (9 * π)) * r) =
      (9 * π ^ 2 + 16) / (9 * π ^ 2 - 16) ∧
    (π * r + (π / 2 - 8 / (9 * π)) * r) / (π * r - (π / 2 - 8 / (9 * π)) * r) =
      (27 * π ^ 2 - 16) / (9 * π ^ 2 + 16) := by
  intro δ
  have hπ : 0 < π := pi_pos
  have hπ3 : 3 < π := pi_gt_three
  have h1 : 9 * π ^ 2 - 16 ≠ 0 := by nlinarith
  have h2 : 9 * π ^ 2 + 16 ≠ 0 := by positivity
  have h3 : π / 2 - 8 / (9 * π) ≠ 0 := by
    rw [show π / 2 - 8 / (9 * π) = (9 * π ^ 2 - 16) / (18 * π) by field_simp; ring]
    exact div_ne_zero h1 (by positivity)
  refine ⟨by simp only [δ]; ring, by ring, by simp only [δ]; field_simp; ring, by field_simp; ring,
    ?_, ?_⟩
  · rw [div_eq_div_iff (mul_ne_zero h3 hr.ne') h1]; field_simp; ring
  · have h4 : π * r - (π / 2 - 8 / (9 * π)) * r ≠ 0 := by
      rw [show π * r - (π / 2 - 8 / (9 * π)) * r = (9 * π ^ 2 + 16) / (18 * π) * r by field_simp; ring]
      exact mul_ne_zero (div_ne_zero h2 (by positivity)) hr.ne'
    rw [div_eq_div_iff h4 h2]; field_simp; ring

/-- **Le solide autour de l'axe**, question 4. The two cylinders are as `π : 4`; with the letter's
numbers, `(11/18)/(5/8) · π/4 = (44/45) π/4`; the true ratio `(9π² − 16)/(30π)` is not
`q π/4` for any rational `q` (`π²` irrational). -/
theorem solid_ineffable (hirr : Irrational (π ^ 2)) :
    (2 * π ^ 3) / (8 * π ^ 2) = π / 4 ∧ (11 / 18 : ℝ) / (5 / 8) = 44 / 45 ∧
    ∀ q : ℚ, (9 * π ^ 2 - 16) / (30 * π) ≠ q * (π / 4) := by
  have hπ : 0 < π := Real.pi_pos
  refine ⟨by field_simp; ring, by norm_num, fun q h => ?_⟩
  have e := h
  rw [div_eq_iff (by positivity)] at e
  have h' : π ^ 2 * (9 - 15 * q / 2) = 16 := by linear_combination e
  by_cases hq : (9 : ℝ) - 15 * q / 2 = 0
  · rw [hq, mul_zero] at h'; norm_num at h'
  · have : π ^ 2 = ((16 / (9 - 15 * q / 2) : ℚ) : ℝ) := by
      push_cast; rw [eq_div_iff hq]; linear_combination h'
    exact hirr ⟨_, this.symm⟩

/-- **Le solide autour de l'axe**, question 5. With `π = 22/7` the ratio is `893/1452`; it would be
`11/18` only for `π² = 48/5`, and `48/5 < (3 + 10/71)²`: below Archimedes' lower bound. -/
theorem solid_archimedes :
    (3 : ℝ) / 4 - 4 / (3 * (22 / 7) ^ 2) = 893 / 1452 ∧ (3 : ℝ) / 4 - 4 / (3 * (48 / 5)) = 11 / 18 ∧
    (48 / 5 : ℝ) < (3 + 10 / 71) ^ 2 := by
  norm_num

end Solid


/-! ## « Trois valeurs de π et un polygone de 97 côtés » -/

section Pi

open Real

/-- **Trois valeurs de π**, question 1. Fabre's rule, `(√5/2) a = p a/(2√2)`, assumes `p = √10`. -/
theorem fabre_rule (a p : ℝ) (ha : 0 < a) (h : √5 / 2 * a = p * a / (2 * √2)) : p = √10 := by
  have h2 : (0 : ℝ) < √2 := by positivity
  have : p = √5 * √2 := by field_simp at h; nlinarith
  rw [this, ← Real.sqrt_mul (by norm_num)]; norm_num

/-- **Trois valeurs de π**, question 2. Cornu's rule, `(p r/2)/(r√2) = 10/9`, assumes
`p = 20√2/9`; and the perimeter `n tan(π/n)` of the circumscribed `n`-gon (diameter 1) exceeds
`π`. The value `97 tan(π/97)` is not computed. -/
theorem cornu_rule (r p : ℝ) (hr : 0 < r) (h : (p * r / 2) / (r * √2) = 10 / 9) :
    p = 20 * √2 / 9 := by
  have h2 : (0 : ℝ) < √2 := by positivity
  field_simp at h; linarith

theorem circumscribed_gt (n : ℕ) (hn : 2 < n) : π < n * tan (π / n) := by
  have hn' : (0 : ℝ) < n := by positivity
  have h1 : 0 < π / n := by positivity
  have h2 : π / n < π / 2 := by
    apply div_lt_div_of_pos_left pi_pos (by norm_num); exact_mod_cast hn
  have := Real.lt_tan h1 h2
  calc π = n * (π / n) := by field_simp
    _ < n * tan (π / n) := by gcongr

/-- **Trois valeurs de π**, questions 3–5. `3 + (112/113)(1/7) = 355/113`; `99² = 2·70² + 1`, so
`(99/70)² = 2 + 1/4900`; with `π = 22/7`, the circle of diameter 8 is `352/7 = 50 + 2/7` (not
`50 + 4/7`), the square of diagonal 10 is `50`, and the excess `2/7` is `1/176` of the circle
(not `1/88`). -/
theorem pi_values :
    (3 : ℚ) + 112 / 113 * (1 / 7) = 355 / 113 ∧ (99 : ℤ) ^ 2 = 2 * 70 ^ 2 + 1 ∧
    ((99 : ℚ) / 70) ^ 2 = 2 + 1 / 4900 ∧
    (22 : ℚ) / 7 * 4 ^ 2 = 352 / 7 ∧ (352 : ℚ) / 7 = 50 + 2 / 7 ∧ (352 : ℚ) / 7 ≠ 50 + 4 / 7 ∧
    (10 : ℚ) ^ 2 / 2 = 50 ∧ ((352 : ℚ) / 7 - 50) / (352 / 7) = 1 / 176 := by
  norm_num

end Pi

/-! ## « Les chants de huit notes sans septième ni sixte » -/

/-- **Les chants de huit notes**, the counts: `|X| = |Y| = 2·7! = 10080`, `|X ∩ Y| = 2·6! = 1440`,
`|X ∪ Y| = 18720`, and `8! − 18720 = 21600` permitted songs; `8! = 40320`, of which « 4320 » is a
slip. The exhaustive count over the permutations is not done here. -/
theorem songs :
    2 * Nat.factorial 7 = 10080 ∧ 2 * Nat.factorial 6 = 1440 ∧
    10080 + 10080 - 1440 = 18720 ∧ Nat.factorial 8 = 40320 ∧ Nat.factorial 8 - 18720 = 21600 ∧
    Nat.factorial 8 ≠ 4320 := by
  decide

/-! ## « Cinquante-trois commas, douze demi-tons et les fractions continues » -/

section Commas

open Real

/-- If `2ᵃ < rⁿ` then `a < n log₂ r`. -/
theorem lt_mul_logb {r : ℝ} (hr : 0 < r) (a n : ℕ) (h : (2 : ℝ) ^ a < r ^ n) :
    (a : ℝ) < n * logb 2 r := by
  have := Real.logb_lt_logb one_lt_two (by positivity) h
  rwa [Real.logb_pow, Real.logb_pow, Real.logb_self_eq_one one_lt_two, mul_one] at this

/-- If `rⁿ < 2ᵃ` then `n log₂ r < a`. -/
theorem mul_logb_lt {r : ℝ} (hr : 0 < r) (a n : ℕ) (h : r ^ n < (2 : ℝ) ^ a) :
    n * logb 2 r < a := by
  have := Real.logb_lt_logb one_lt_two (by positivity) h
  rwa [Real.logb_pow, Real.logb_pow, Real.logb_self_eq_one one_lt_two, mul_one] at this

/-- `53 log₂ r` is within `1/2` of `c` when `2^{2c−1} < r^{106} < 2^{2c+1}`. -/
theorem nearest_comma {r : ℝ} (hr : 0 < r) (c : ℕ) (hc : 1 ≤ c)
    (h1 : (2 : ℝ) ^ (2 * c - 1) < r ^ 106) (h2 : r ^ 106 < (2 : ℝ) ^ (2 * c + 1)) :
    |53 * logb 2 r - c| < 1 / 2 := by
  have a := lt_mul_logb hr _ _ h1
  have b := mul_logb_lt hr _ _ h2
  push_cast [Nat.cast_sub (show 1 ≤ 2 * c by omega)] at a b
  rw [abs_lt]; constructor <;> linarith

/-- **Cinquante-trois commas**, question 1. The nearest integers to `53 log₂ r`: `2` for the
diesis `128/125` (the leaf's `3` is `25/24`), and `5, 8, 9, 14, 17, 22, 31, 36, 39` for
`16/15, 10/9, 9/8, 6/5, 5/4, 4/3, 3/2, 8/5, 5/3`, the leaf's numbers; `25/24 · 16/15 = 10/9`. -/
theorem commas :
    |53 * logb 2 (128 / 125) - 2| < 1 / 2 ∧ |53 * logb 2 (25 / 24) - 3| < 1 / 2 ∧
    |53 * logb 2 (16 / 15) - 5| < 1 / 2 ∧ |53 * logb 2 (10 / 9) - 8| < 1 / 2 ∧
    |53 * logb 2 (9 / 8) - 9| < 1 / 2 ∧ |53 * logb 2 (6 / 5) - 14| < 1 / 2 ∧
    |53 * logb 2 (5 / 4) - 17| < 1 / 2 ∧ |53 * logb 2 (4 / 3) - 22| < 1 / 2 ∧
    |53 * logb 2 (3 / 2) - 31| < 1 / 2 ∧ |53 * logb 2 (8 / 5) - 36| < 1 / 2 ∧
    |53 * logb 2 (5 / 3) - 39| < 1 / 2 ∧ (25 / 24 : ℚ) * (16 / 15) = 10 / 9 := by
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_, ?_, by norm_num⟩ <;>
  · first
    | exact_mod_cast nearest_comma (by norm_num) 2 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 3 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 5 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 8 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 9 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 14 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 17 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 22 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 31 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 36 (by norm_num) (by norm_num) (by norm_num)
    | exact_mod_cast nearest_comma (by norm_num) 39 (by norm_num) (by norm_num) (by norm_num)

/-- **Cinquante-trois commas**, question 2. The convergents of `[0; 1, 1, 2, 2, 3, 1, 5]` are
`0/1, 1/1, 1/2, 3/5, 7/12, 24/41, 31/53`; and `7/12 < log₂(3/2)`, `31/53 < log₂(3/2) < 24/41`
(from `2¹⁹ < 3¹²`, `2⁸⁴ < 3⁵³`, `3⁴¹ < 2⁶⁵`), so `0 < log₂(3/2) − 31/53 < 1/2173`. -/
theorem fifth_convergents :
    ((0 : ℚ) + 1 / (1 + 1 / (1 + 1 / (2 + 1 / (2 + 1 / (3 + 1 / (1 + 1 / 5))))))) = 31 / 53 ∧
    (0 : ℚ) + 1 / (1 + 1 / (1 + 1 / (2 + 1 / 2))) = 7 / 12 ∧
    (7 / 12 : ℝ) < logb 2 (3 / 2) ∧ (31 / 53 : ℝ) < logb 2 (3 / 2) ∧ logb 2 (3 / 2) < 24 / 41 ∧
    (24 / 41 : ℝ) - 31 / 53 = 1 / 2173 := by
  have l7 := lt_mul_logb (r := 3 / 2) (by norm_num) 7 12 (by norm_num)
  have l31 := lt_mul_logb (r := 3 / 2) (by norm_num) 31 53 (by norm_num)
  have l24 := mul_logb_lt (r := 3 / 2) (by norm_num) 24 41 (by norm_num)
  push_cast at l7 l31 l24
  refine ⟨by norm_num, by norm_num, by linarith, by linarith, by linarith, by norm_num⟩

/-- **Cinquante-trois commas**, question 3. The tempered major third is closer to the just one than
the tempered minor third: `0 < 400 − 1200 log₂(5/4) < 1200 log₂(6/5) − 300`, which comes down to
`7/12 < log₂(3/2)`; in « commas », `4 · 53/12 = 17 + 2/3` and `3 · 53/12 = 13 + 1/4`. -/
theorem thirds :
    0 < 400 - 1200 * logb 2 (5 / 4) ∧ 0 < 1200 * logb 2 (6 / 5) - 300 ∧
    400 - 1200 * logb 2 (5 / 4) < 1200 * logb 2 (6 / 5) - 300 ∧
    (4 : ℚ) * 53 / 12 = 17 + 2 / 3 ∧ (3 : ℚ) * 53 / 12 = 13 + 1 / 4 := by
  have a := mul_logb_lt (r := 5 / 4) (by norm_num) 1 3 (by norm_num)
  have b := lt_mul_logb (r := 6 / 5) (by norm_num) 1 4 (by norm_num)
  have c := lt_mul_logb (r := 3 / 2) (by norm_num) 7 12 (by norm_num)
  have hm : logb 2 (3 / 2) = logb 2 (5 / 4) + logb 2 (6 / 5) := by
    rw [← Real.logb_mul (by norm_num) (by norm_num)]; norm_num
  push_cast at a b c
  refine ⟨by linarith, by linarith, by linarith, by norm_num, by norm_num⟩

/-- **Cinquante-trois commas**, question 4. `(3/2)³/(10/3) = 81/80`, `2/(5/4)³ = 128/125`;
in equal semitones `3·7 = 12 + 9` and `3·4 = 12`. -/
theorem tempered_identities :
    ((3 : ℚ) / 2) ^ 3 / (2 * (5 / 3)) = 81 / 80 ∧ (2 : ℚ) / (5 / 4) ^ 3 = 128 / 125 ∧
    3 * 7 = 12 + 9 ∧ 3 * 4 = 12 := by
  norm_num

end Commas

/-! ## « La latitude de Paris par l'étoile polaire et par le Soleil » -/

/-- Degrees, minutes, seconds, in seconds. -/
def dms (d m s : ℚ) : ℚ := d * 3600 + m * 60 + s

/-- **La latitude de Paris**, questions 1 and 2, the arithmetic of the sheet. `φ` is half the sum
of the two heights of the pole star, `48°45'37½''`, and `p` half the difference, `2°43'7½''`;
`17°45' + 2'58'' + 23°30'22'' = 41°18'20''`, and `90° − 41°18'20'' = 48°41'40''`. The declination
by `sin δ = sin ε sin λ` is not computed. -/
theorem latitude :
    (dms 51 28 45 + dms 46 2 30) / 2 = dms 48 45 (37 + 1 / 2) ∧
    (dms 51 28 45 - dms 46 2 30) / 2 = dms 2 43 (7 + 1 / 2) ∧
    dms 17 45 0 + dms 0 2 58 + dms 23 30 22 = dms 41 18 20 ∧
    dms 90 0 0 - dms 41 18 20 = dms 48 41 40 := by
  norm_num [dms]

/-! ## « Le partage des enjeux » and « La formule générale des partis » -/

/-- `Σ_{k=i}^{N} C(N, k)`. -/
def tail (N i : ℕ) : ℕ := ∑ k ∈ Finset.Icc i N, N.choose k

/-- The formula of « La formule générale des partis »: `P(i, j) = 2^{−N} Σ_{k ≥ i} C(N, k)`, with
`N = i + j − 1`. -/
def P (i j : ℕ) : ℚ := (tail (i + j - 1) i : ℚ) / 2 ^ (i + j - 1)

/-- **Le partage des enjeux**, questions 2–4, and **La formule générale des partis**, question 1,
on the positions of the leaf: the boundary values, the recurrence
`P(i, j) = (P(i − 1, j) + P(i, j − 1))/2` at each position used, and the values `3/4`,
`11/16`, `14/16`, `12/16`, `15/16`, `13/16`, `21/32`; the games are worth `3/16`, `3/16`,
`2/16`. The recurrence for every `(i, j)` is not proved. -/
theorem stakes :
    P 0 2 = 1 ∧ P 1 0 = 0 ∧ P 1 1 = 1 / 2 ∧ P 1 2 = 3 / 4 ∧ P 1 2 = (P 0 2 + P 1 1) / 2 ∧
    P 2 2 = 1 / 2 ∧ P 1 3 = 7 / 8 ∧ P 2 3 = 11 / 16 ∧ P 2 3 = (P 1 3 + P 2 2) / 2 ∧
    P 1 4 = 15 / 16 ∧ P 1 4 = (P 0 4 + P 1 3) / 2 ∧ P 2 4 = 13 / 16 ∧
    P 2 4 = (P 1 4 + P 2 3) / 2 ∧ P 3 3 = 1 / 2 ∧ P 3 4 = 21 / 32 ∧ P 3 4 = (P 2 4 + P 3 3) / 2 ∧
    (11 / 16 - 8 / 16 : ℚ) = 3 / 16 ∧ (14 / 16 - 11 / 16 : ℚ) = 3 / 16 ∧ (1 - 14 / 16 : ℚ) = 2 / 16 ∧
    (13 / 16 : ℚ) - 3 / 4 = 1 / 16 ∧ (3 / 4 : ℚ) - 1 / 2 = 1 / 4 := by
  simp only [P, tail]
  decide

/-- **La formule générale des partis**, question 2. Three players, a match of two games: with
`A`, `B` one game each and `C` none, `A` has `(1 + 0 + 1/3)/3 = 12/27` and `C` `3/27`; with `A` one
game and `B`, `C` none, `A` has `(1 + 12/27 + 12/27)/3 = 17/27`, `B` and `C` `5/27` each. -/
theorem three_players :
    (1 + 0 + 1 / 3 : ℚ) / 3 = 12 / 27 ∧ 1 - 2 * (12 / 27 : ℚ) = 3 / 27 ∧
    (1 + 12 / 27 + 12 / 27 : ℚ) / 3 = 17 / 27 ∧ (1 - 17 / 27 : ℚ) / 2 = 5 / 27 := by
  norm_num

/-- **La formule générale des partis**, question 3. With `x = (a + b)/2` in hand, playing `x`
against `x` with the winner giving `a` to the loser leaves the winner `b` and the loser `a`; for
`11`: `22 − 9 = 13`. -/
theorem fair_game (a b : ℚ) : 2 * ((a + b) / 2) - a = b ∧ (22 - 9 : ℚ) = 13 := by
  constructor <;> ring

end Germain.Exercises.Mersenne
