import Mathlib

/-!
# The Pierre de Fermat chapter of the exercise book

`exercises/exercices.fr.tex`, section « Pierre de Fermat (1601--1665) ».

* « Éliminer une racine seconde : l'analogie redoublée et le résultant » (nal-2339, views 41–43):
  `elim_first_analogy`, `elim_divided`, `elim_second_analogy`, `elim_leaf_quotient`,
  `elim_denominator_pos`, `elim_division`, `elim_two_quotients`, `elim_resultant`,
  `elim_final_equation`, `elim_example`. That `R` is mathlib's `Polynomial.resultant` is not
  proved; question 4 is proved in the form the solution uses, the product `f(y₁) f(y₂)` over the
  two roots of the quadratic.

* « Le plus grand rectangle, par adæqualité puis par la dérivée » (nal-2339, views 27–28):
  `rect_adequality`, `rect_max`, `rect_squares`, `rect_cube`.
* « La tangente à la parabole : l'inégalité des deux côtés » (nal-2339, views 29–30): `F_factor`,
  `outside_iff`, `one_side_iff`, `second_point`, `two_sides_iff`, `tangent_F`, `subtangent`. The
  similar triangles of question 1 are taken as the coordinates of `O`, as in the solution.
-/

namespace Germain.Exercises.Fermat

/-- `R = P² + D³P + 3DPQ − Q³`. -/
def R (D P Q : ℝ) : ℝ := P ^ 2 + D ^ 3 * P + 3 * D * P * Q - Q ^ 3

/-- **Éliminer une racine seconde**, question 1. The right equality `P(y² + Dy) = Qy³` is a
combination of the two equations `P − y³ = 0` and `Q − y² − Dy = 0`. -/
theorem elim_first_analogy (P Q D y : ℝ) :
    P * (y ^ 2 + D * y) - Q * y ^ 3 = (y ^ 2 + D * y) * (P - y ^ 3) - y ^ 3 * (Q - y ^ 2 - D * y) := by
  ring

/-- **Éliminer une racine seconde**, question 1. Divided by `y ≠ 0`, it is of the second degree:
`P(y + D) = Qy²`. -/
theorem elim_divided (P Q D y : ℝ) (hy : y ≠ 0) (h : P * (y ^ 2 + D * y) = Q * y ^ 3) :
    P * (y + D) = Q * y ^ 2 := by
  apply mul_left_cancel₀ hy; linear_combination h

/-- **Éliminer une racine seconde**, question 2. In a common solution, `y (Q² − DP) = P (Q + D²)`
(the leaf reaches it after dividing by `y`; as an identity it holds for every common solution). -/
theorem elim_second_analogy (P Q D y : ℝ) (hP : P = y ^ 3) (hQ : Q = y ^ 2 + D * y) :
    y * (Q ^ 2 - D * P) = P * (Q + D ^ 2) := by
  subst hP hQ; ring

/-- **Éliminer une racine seconde**, question 2. The leaf's numerator and denominator are
`P(Q + D²)` and `Q² − DP`, with `P = Z − x³`, `Q = N² − Bx`. -/
theorem elim_leaf_quotient (B D N Z x : ℝ) :
    let P := Z - x ^ 3
    let Q := N ^ 2 - B * x
    Z * D ^ 2 - x ^ 3 * D ^ 2 + N ^ 2 * Z - N ^ 2 * x ^ 3 - B * Z * x + B * x ^ 4 = P * (Q + D ^ 2) ∧
    N ^ 4 - N ^ 2 * B * x - B * x * N ^ 2 + B ^ 2 * x ^ 2 - Z * D + x ^ 3 * D = Q ^ 2 - D * P := by
  constructor <;> ring

/-- **Éliminer une racine seconde**, question 2. In a common real solution with `y ≠ 0`, the
denominator `Q² − DP = y²((y + D/2)² + 3D²/4)` is positive. -/
theorem elim_denominator_pos (P Q D y : ℝ) (hy : y ≠ 0) (hP : P = y ^ 3) (hQ : Q = y ^ 2 + D * y) :
    Q ^ 2 - D * P = y ^ 2 * ((y + D / 2) ^ 2 + 3 * D ^ 2 / 4) ∧ 0 < Q ^ 2 - D * P := by
  subst hP hQ
  refine ⟨by ring, ?_⟩
  have h1 : 0 < y ^ 2 := by positivity
  have h2 : 0 < (y + D / 2) ^ 2 + 3 * D ^ 2 / 4 := by
    rcases eq_or_ne D 0 with hD | hD
    · subst hD; simp; positivity
    · have : 0 < 3 * D ^ 2 / 4 := by positivity
      nlinarith [sq_nonneg (y + D / 2)]
  nlinarith [mul_pos h1 h2]

/-- **Éliminer une racine seconde**, question 3. Euclidean division of `y³ − P` by `y² + Dy − Q`. -/
theorem elim_division (P Q D y : ℝ) :
    y ^ 3 - P = (y - D) * (y ^ 2 + D * y - Q) + ((Q + D ^ 2) * y - (P + D * Q)) := by
  ring

/-- **Éliminer une racine seconde**, question 3. `P(Q + D²)² − (P + DQ)(Q² − DP) = D R`: where the
denominators do not vanish, the leaf's quotient and the division's agree exactly when `R = 0`. -/
theorem elim_two_quotients (P Q D : ℝ) :
    P * (Q + D ^ 2) ^ 2 - (P + D * Q) * (Q ^ 2 - D * P) = D * R D P Q := by
  unfold R; ring

/-- **Éliminer une racine seconde**, question 4. If `y₁ + y₂ = −D` and `y₁ y₂ = −Q` (the two roots
of `y² + Dy − Q`), then `(y₁³ − P)(y₂³ − P) = R`: the resultant of `y³ − P` and `y² + Dy − Q`. -/
theorem elim_resultant (P Q D y₁ y₂ : ℝ) (hs : y₁ + y₂ = -D) (hp : y₁ * y₂ = -Q) :
    (y₁ ^ 3 - P) * (y₂ ^ 3 - P) = R D P Q := by
  unfold R
  have h3 : y₁ ^ 3 + y₂ ^ 3 = (y₁ + y₂) ^ 3 - 3 * (y₁ * y₂) * (y₁ + y₂) := by ring
  have : (y₁ ^ 3 - P) * (y₂ ^ 3 - P) = (y₁ * y₂) ^ 3 - P * (y₁ ^ 3 + y₂ ^ 3) + P ^ 2 := by ring
  rw [this, h3, hs, hp]; ring

/-- **Éliminer une racine seconde**, question 5. Carrying the leaf's `y` into `Q = y² + Dy` and
clearing the denominator gives `−Q² R`, of degree 8 in `x`. -/
theorem elim_final_equation (P Q D : ℝ) :
    Q * (Q ^ 2 - D * P) ^ 2 - P ^ 2 * (Q + D ^ 2) ^ 2 - D * P * (Q + D ^ 2) * (Q ^ 2 - D * P) =
      -(Q ^ 2 * R D P Q) := by
  unfold R; ring

/-- **Éliminer une racine seconde**, question 5, the example `B = D = 1`, `N² = 3`, `Z = 2`.
`(1, 1)` is a solution; `R = x⁶ + 3x⁴ − 13x³ − 9x² + 21x − 3 = (x − 1)(x⁵ + x⁴ + 4x³ − 9x² − 18x + 3)`;
at `x = 3`, `Q = 0`, `P = −25`, the second equation gives `y ∈ {0, −1}`, neither satisfies
`y³ = −25`, and `R(3) = 600`. -/
theorem elim_example (x y : ℝ) :
    ((1 : ℝ) ^ 3 + 1 ^ 3 = 2 ∧ (1 : ℝ) * 1 + 1 ^ 2 + 1 * 1 = 3) ∧
    R 1 (2 - x ^ 3) (3 - x) = x ^ 6 + 3 * x ^ 4 - 13 * x ^ 3 - 9 * x ^ 2 + 21 * x - 3 ∧
    x ^ 6 + 3 * x ^ 4 - 13 * x ^ 3 - 9 * x ^ 2 + 21 * x - 3 =
      (x - 1) * (x ^ 5 + x ^ 4 + 4 * x ^ 3 - 9 * x ^ 2 - 18 * x + 3) ∧
    (1 * 3 + y ^ 2 + 1 * y = 3 → y = 0 ∨ y = -1) ∧
    ((0 : ℝ) ^ 3 ≠ -25 ∧ (-1 : ℝ) ^ 3 ≠ -25) ∧ R 1 (2 - 3 ^ 3) (3 - 3) = 600 := by
  refine ⟨by norm_num, by unfold R; ring, by ring, fun h => ?_, by norm_num, by unfold R; norm_num⟩
  have : y * (y + 1) = 0 := by linear_combination h
  rcases mul_eq_zero.1 this with h | h
  · left; exact h
  · right; linarith


/-! ## « Le plus grand rectangle, par adæqualité puis par la dérivée » -/

/-- The rectangle `AE · EC` with `AE = x`, `AC = B`. -/
def rect (B x : ℝ) : ℝ := x * (B - x)

/-- **Le plus grand rectangle**, questions 1 and 2. `f(x + e) − f(x) = e (B − 2x − e)`; for
`e ≠ 0` the quotient is `B − 2x − e`, whose value at `e = 0` is the derivative `B − 2x`. -/
theorem rect_adequality (B x e : ℝ) (he : e ≠ 0) :
    rect B (x + e) - rect B x = e * (B - 2 * x - e) ∧
    (rect B (x + e) - rect B x) / e = B - 2 * x - e ∧
    HasDerivAt (rect B) (B - 2 * x) x := by
  refine ⟨by unfold rect; ring, ?_, ?_⟩
  · rw [show rect B (x + e) - rect B x = e * (B - 2 * x - e) by unfold rect; ring]
    field_simp
  · have h := ((hasDerivAt_id x).mul ((hasDerivAt_const x B).sub (hasDerivAt_id x)))
    convert h using 1
    · ext y; simp [rect]
    · simp; ring

/-- **Le plus grand rectangle**, question 3. `f(B/2 + h) = B²/4 − h²`: the middle gives the largest
rectangle, `B²/4`, and only the middle; for `B = 10`, `25` against `4 · 6 = 24`. -/
theorem rect_max (B h : ℝ) :
    rect B (B / 2 + h) = B ^ 2 / 4 - h ^ 2 ∧ (∀ x, rect B x ≤ B ^ 2 / 4) ∧
    (∀ x, rect B x = B ^ 2 / 4 → x = B / 2) ∧ rect 10 5 = 25 ∧ rect 10 4 = 24 := by
  refine ⟨by unfold rect; ring, fun x => ?_, fun x hx => ?_, by norm_num [rect],
    by norm_num [rect]⟩
  · unfold rect; nlinarith [sq_nonneg (x - B / 2)]
  · unfold rect at hx
    have : (x - B / 2) ^ 2 = 0 := by linear_combination -hx
    have := pow_eq_zero_iff two_ne_zero |>.1 this
    linarith

/-- **Le plus grand rectangle**, question 4. For `g(x) = x² + (B − x)²` the rule gives the same
point, `g(x + e) − g(x) = e (4x − 2B + 2e)`, but `g(B/2 + h) = B²/2 + 2h²`: it is a minimum. -/
theorem rect_squares (B x e h : ℝ) :
    (x + e) ^ 2 + (B - (x + e)) ^ 2 - (x ^ 2 + (B - x) ^ 2) = e * (4 * x - 2 * B + 2 * e) ∧
    (B / 2 + h) ^ 2 + (B - (B / 2 + h)) ^ 2 = B ^ 2 / 2 + 2 * h ^ 2 ∧
    (∀ y : ℝ, B ^ 2 / 2 ≤ y ^ 2 + (B - y) ^ 2) := by
  refine ⟨by ring, by ring, fun y => by nlinarith [sq_nonneg (y - B / 2)]⟩

/-- **Le plus grand rectangle**, question 4. The rule finds where the derivative vanishes, which is
not an extremum in general: `x³` has derivative `0` at `0` and is strictly increasing. -/
theorem rect_cube : HasDerivAt (fun x : ℝ => x ^ 3) 0 0 ∧ StrictMono (fun x : ℝ => x ^ 3) := by
  refine ⟨?_, Odd.strictMono_pow (by decide)⟩
  simpa using hasDerivAt_pow 3 (0 : ℝ)

/-! ## « La tangente à la parabole : l'inégalité des deux côtés » -/

/-- `F(e) = d (a − e)² − (d − e) a²`. -/
def F (a d e : ℝ) : ℝ := d * (a - e) ^ 2 - (d - e) * a ^ 2

/-- **La tangente à la parabole**, question 2. `F(e) = e (a² − 2da + de)`, and `F'(0) = a² − 2da`:
the leaf's adæqualitas computes `F'(0)`. -/
theorem F_factor (a d e : ℝ) :
    F a d e = e * (a ^ 2 - 2 * d * a + d * e) ∧ HasDerivAt (F a d) (a ^ 2 - 2 * d * a) 0 := by
  refine ⟨by unfold F; ring, ?_⟩
  have h := ((((hasDerivAt_id (0 : ℝ)).const_sub a).pow 2).const_mul d).sub
    (((hasDerivAt_id (0 : ℝ)).const_sub d).mul_const (a ^ 2))
  convert h using 1
  · funext e; simp [F]
  · simp; ring

/-- **La tangente à la parabole**, question 2. With `BC² = pd`, `p > 0`, `a ≠ 0`, the point `O`
of abscissa `d − e` and ordinate `BC (a − e)/a` is outside the parabola `v² = pu` exactly when
`F(e) > 0`, for every real `e`. -/
theorem outside_iff (p a d e BC : ℝ) (hp : 0 < p) (ha : a ≠ 0) (hB : BC ^ 2 = p * d) :
    (BC * (a - e) / a) ^ 2 > p * (d - e) ↔ F a d e > 0 := by
  have ha2 : 0 < a ^ 2 := by positivity
  have key : (BC * (a - e) / a) ^ 2 - p * (d - e) = p / a ^ 2 * F a d e := by
    unfold F; rw [div_pow, mul_pow, hB]; field_simp
  constructor
  · intro h
    have : 0 < p / a ^ 2 * F a d e := by rw [← key]; linarith
    exact pos_of_mul_pos_right this (by positivity)
  · intro h
    have : 0 < p / a ^ 2 * F a d e := mul_pos (by positivity) h
    linarith

/-- **La tangente à la parabole**, question 3. For `a, d > 0`, `F(e) > 0` for every `e ∈ ]0, a[`
exactly when `a ≥ 2d`: from one side the inequality only gives `a ≥ 2d`. -/
theorem one_side_iff (a d : ℝ) (ha : 0 < a) (hd : 0 < d) :
    (∀ e, 0 < e → e < a → F a d e > 0) ↔ 2 * d ≤ a := by
  constructor
  · intro h
    by_contra hlt0
    have hlt := not_le.1 hlt0
    -- take `e = a(2d − a)/(2d)`, half of the root `a(2d − a)/d`, inside `]0, a[`
    set e := a * (2 * d - a) / (2 * d) with he
    have he0 : 0 < e := by rw [he]; apply div_pos (mul_pos ha (by linarith)) (by linarith)
    have hea : e < a := by
      rw [he, div_lt_iff₀ (by linarith)]; nlinarith
    have := h e he0 hea
    rw [(F_factor a d e).1] at this
    have h2 : a ^ 2 - 2 * d * a + d * e = -(a * (2 * d - a)) / 2 := by
      rw [he]; field_simp; ring
    rw [h2] at this
    have : 0 < -(a * (2 * d - a)) / 2 := pos_of_mul_pos_right this he0.le
    nlinarith [mul_pos ha (show 0 < 2 * d - a by linarith)]
  · intro h e he0 _
    rw [(F_factor a d e).1]
    exact mul_pos he0 (by nlinarith [mul_nonneg ha.le (show 0 ≤ a - 2 * d by linarith)])

/-- **La tangente à la parabole**, question 3. For `a = 3d`, `F(e) = de(3d + e)`, and the line
meets the parabola again at `e = −3d`: abscissa `4d`, ordinate `2 BC`, and `(2BC)² = p · 4d`. -/
theorem second_point (p d BC e : ℝ) (hd : d ≠ 0) (hB : BC ^ 2 = p * d) :
    F (3 * d) d e = d * e * (3 * d + e) ∧ F (3 * d) d (-3 * d) = 0 ∧
    d - (-3 * d) = 4 * d ∧ BC * (3 * d - (-3 * d)) / (3 * d) = 2 * BC ∧
    (2 * BC) ^ 2 = p * (4 * d) := by
  refine ⟨by unfold F; ring, by unfold F; ring, by ring, by field_simp; ring, by
    linear_combination 4 * hB⟩

/-- **La tangente à la parabole**, question 4. Asking also `F(e) > 0` for `e < 0` near `0` forces
`a = 2d`; then `F(e) = de² > 0` for every `e ≠ 0`: the line touches the parabola only at `B`. -/
theorem two_sides_iff (a d : ℝ) (ha : 0 < a) (hd : 0 < d) :
    ((∀ e, 0 < e → e < a → F a d e > 0) ∧ ∃ ε > 0, ∀ e, -ε < e → e < 0 → F a d e > 0) ↔
      a = 2 * d := by
  constructor
  · rintro ⟨h1, ε, hε, h2⟩
    have hge := (one_side_iff a d ha hd).1 h1
    by_contra hne
    have hgt : 2 * d < a := lt_of_le_of_ne hge (Ne.symm hne)
    -- for `e < 0` near `0`, `a² − 2da + de > 0`, so `F(e) < 0`
    set e := -min (ε / 2) (a * (a - 2 * d) / (2 * d)) with he
    have hpos : 0 < a * (a - 2 * d) / (2 * d) := div_pos (mul_pos ha (by linarith)) (by linarith)
    have hm : 0 < min (ε / 2) (a * (a - 2 * d) / (2 * d)) := lt_min (by linarith) hpos
    have he0 : e < 0 := by rw [he]; linarith
    have heε : -ε < e := by rw [he]; have := min_le_left (ε / 2) (a * (a - 2 * d) / (2 * d)); linarith
    have := h2 e heε he0
    rw [(F_factor a d e).1] at this
    have hq : 0 < a ^ 2 - 2 * d * a + d * e := by
      have hmin := min_le_right (ε / 2) (a * (a - 2 * d) / (2 * d))
      have : d * min (ε / 2) (a * (a - 2 * d) / (2 * d)) ≤ a * (a - 2 * d) / 2 := by
        calc d * min (ε / 2) (a * (a - 2 * d) / (2 * d)) ≤ d * (a * (a - 2 * d) / (2 * d)) :=
              mul_le_mul_of_nonneg_left hmin hd.le
          _ = a * (a - 2 * d) / 2 := by field_simp
      rw [he]; nlinarith [mul_pos ha (show 0 < a - 2 * d by linarith)]
    nlinarith [mul_neg_of_neg_of_pos he0 hq]
  · intro h
    subst h
    refine ⟨fun e he0 _ => ?_, ⟨1, one_pos, fun e _ he0 => ?_⟩⟩
    · rw [(F_factor _ d e).1]; nlinarith [mul_pos hd (mul_pos he0 he0)]
    · rw [(F_factor _ d e).1]; nlinarith [mul_pos hd (mul_pos_of_neg_of_neg he0 he0)]

/-- **La tangente à la parabole**, question 4. With `a = 2d`, `F(e) = de²`. -/
theorem tangent_F (d e : ℝ) : F (2 * d) d e = d * e ^ 2 := by unfold F; ring

/-- **La tangente à la parabole**, question 5. The derivative of `u ↦ √(pu)` at `d > 0` is
`p / (2√(pd))`, and the subtangent `v / v'` is `2d`: `CE = 2 cd`. -/
theorem subtangent (p d : ℝ) (hp : 0 < p) (hd : 0 < d) :
    HasDerivAt (fun u => Real.sqrt (p * u)) (p / (2 * Real.sqrt (p * d))) d ∧
    Real.sqrt (p * d) / (p / (2 * Real.sqrt (p * d))) = 2 * d := by
  have hpd : 0 < p * d := mul_pos hp hd
  have hs : 0 < Real.sqrt (p * d) := Real.sqrt_pos.2 hpd
  constructor
  · have h := ((hasDerivAt_id d).const_mul p).sqrt (by simpa using hpd.ne')
    convert h using 1 <;> simp
  · field_simp
    rw [Real.sq_sqrt hpd.le]

end Germain.Exercises.Fermat
