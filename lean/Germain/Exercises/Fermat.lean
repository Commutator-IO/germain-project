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

Not formalised: the largest rectangle and the tangent to the parabola (analysis, in the book's
category 2).
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

end Germain.Exercises.Fermat
