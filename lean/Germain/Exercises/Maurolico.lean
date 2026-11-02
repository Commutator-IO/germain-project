import Mathlib

/-!
# The Francesco Maurolico chapter of the exercise book

`exercises/exercices.fr.tex`, section « Francesco Maurolico (1494--1575) ».

* « Le théorème de Ptolémée et la formule d'addition » (latin-17859, views 33–34): `ptolemy`
  (mathlib's theorem, question 1), `chord_sq` (question 2, for points of the circle of diameter 1
  given by their central angles), `ptolemy_chords_add` and `ptolemy_chords_sub` (questions 3
  and 4: the chords of the figure, and Ptolemy's relation between them, which is the addition
  formula), `sine_ratio` (the leaf's statement). The step from the figure to the chord lengths
  is done in coordinates, not with inscribed angles.
* « Le « très noble théorème » » (latin-17859, views 35–37): `noble_vectors` (question 1),
  `noble_cosA` (question 2), `noble_theorem` (question 3), `noble_cot_sq` (question 4).

Not formalised: the table of sines (numbers, category 3) and the meetings of two moving points.
-/

namespace Germain.Exercises.Maurolico

open Real EuclideanGeometry

/-! ## « Le théorème de Ptolémée et la formule d'addition » -/

/-- **Le théorème de Ptolémée**, question 1: mathlib's
`EuclideanGeometry.mul_dist_add_mul_dist_eq_mul_dist_of_cospherical`, for a convex quadrilateral
`abcd` inscribed in a circle, whose diagonals `ac` and `bd` meet at `p`. -/
theorem ptolemy {V P : Type*} [NormedAddCommGroup V] [InnerProductSpace ℝ V] [MetricSpace P]
    [NormedAddTorsor V P] {a b c d p : P} (h : Cospherical ({a, b, c, d} : Set P))
    (hapc : ∠ a p c = π) (hbpd : ∠ b p d = π) :
    dist a b * dist c d + dist b c * dist d a = dist a c * dist b d :=
  mul_dist_add_mul_dist_eq_mul_dist_of_cospherical h hapc hbpd

/-- **Le théorème de Ptolémée**, question 2. On the circle of diameter `1` (centre `0`, radius
`1/2`), the points of central angles `α` and `β` are at distance `|sin((α − β)/2)|`: the chord seen
from the circle under the angle `θ = (α − β)/2` (or its supplement) is `sin θ`. -/
theorem chord_sq (α β : ℝ) :
    (cos α / 2 - cos β / 2) ^ 2 + (sin α / 2 - sin β / 2) ^ 2 = sin ((α - β) / 2) ^ 2 := by
  have h : cos (α - β) = 1 - 2 * sin ((α - β) / 2) ^ 2 := by
    have e : α - β = 2 * ((α - β) / 2) := by ring
    conv_lhs => rw [e]
    rw [cos_two_mul]; nlinarith [sin_sq_add_cos_sq ((α - β) / 2)]
  have hsub := cos_sub α β
  linear_combination (1 / 4) * sin_sq_add_cos_sq α + (1 / 4) * sin_sq_add_cos_sq β +
    (1 / 2) * hsub - (1 / 2) * h

/-- The length of the chord between central angles `α` and `β`, on the circle of diameter 1. -/
noncomputable def chord (α β : ℝ) : ℝ :=
  √((cos α / 2 - cos β / 2) ^ 2 + (sin α / 2 - sin β / 2) ^ 2)

theorem chord_eq (α β : ℝ) : chord α β = |sin ((α - β) / 2)| := by
  rw [chord, chord_sq, sqrt_sq_eq_abs]

/-- **Le théorème de Ptolémée**, question 3. `B` and `D` the ends of a diameter (central angles `π`
and `0`), `A` and `C` on either side with `∠ADB = p`, `∠CDB = q` (central angles `π − 2p` and
`−(π − 2q)`). For acute `p` and `q`, `AB = sin p`, `AD = cos p`, `CB = sin q`, `CD = cos q`,
`AC = sin(p + q)`, `BD = 1`, and Ptolemy's relation `BD · AC = AB · CD + AD · CB` is the addition
formula. -/
theorem ptolemy_chords_add (p q : ℝ) (hp : 0 < p) (hp' : p < π / 2) (hq : 0 < q) (hq' : q < π / 2) :
    let A := π - 2 * p
    let C := -(π - 2 * q)
    chord A π = sin p ∧ chord A 0 = cos p ∧ chord C π = sin q ∧ chord C 0 = cos q ∧
    chord A C = sin (p + q) ∧ chord π 0 = 1 ∧
    chord π 0 * chord A C = chord A π * chord C 0 + chord A 0 * chord C π := by
  intro A C
  have sp : 0 < sin p := sin_pos_of_pos_of_lt_pi hp (by linarith)
  have sq : 0 < sin q := sin_pos_of_pos_of_lt_pi hq (by linarith)
  have cp : 0 < cos p := cos_pos_of_mem_Ioo ⟨by linarith, hp'⟩
  have cq : 0 < cos q := cos_pos_of_mem_Ioo ⟨by linarith, hq'⟩
  have spq : 0 < sin (p + q) := sin_pos_of_pos_of_lt_pi (by linarith) (by linarith)
  have h1 : chord A π = sin p := by
    rw [chord_eq, show (A - π) / 2 = -p by simp only [A]; ring, sin_neg, abs_neg, abs_of_pos sp]
  have h2 : chord A 0 = cos p := by
    rw [chord_eq, show (A - 0) / 2 = π / 2 - p by simp only [A]; ring, sin_pi_div_two_sub,
      abs_of_pos cp]
  have h3 : chord C π = sin q := by
    rw [chord_eq, show (C - π) / 2 = q - π by simp only [C]; ring, sin_sub_pi, abs_neg,
      abs_of_pos sq]
  have h4 : chord C 0 = cos q := by
    rw [chord_eq, show (C - 0) / 2 = -(π / 2 - q) by simp only [C]; ring, sin_neg,
      sin_pi_div_two_sub, abs_neg, abs_of_pos cq]
  have h5 : chord A C = sin (p + q) := by
    rw [chord_eq, show (A - C) / 2 = π - (p + q) by simp only [A, C]; ring, sin_pi_sub,
      abs_of_pos spq]
  have h6 : chord π 0 = 1 := by
    rw [chord_eq, show (π - 0) / 2 = π / 2 by ring, sin_pi_div_two, abs_one]
  refine ⟨h1, h2, h3, h4, h5, h6, ?_⟩
  rw [h1, h2, h3, h4, h5, h6, one_mul, sin_add]

/-- **Le théorème de Ptolémée**, question 4. With `C'` on the same side as `A` (central angle
`π − 2q`, `q < p`), the quadrilateral `BC'AD` gives `BA · C'D = BC' · AD + C'A · DB`, that is
`sin(p − q) = sin p cos q − cos p sin q`. -/
theorem ptolemy_chords_sub (p q : ℝ) (hq : 0 < q) (hqp : q < p) (hp' : p < π / 2) :
    let A := π - 2 * p
    let C' := π - 2 * q
    chord C' A = sin (p - q) ∧
    chord A π * chord C' 0 = chord C' π * chord A 0 + chord C' A * chord π 0 := by
  intro A C'
  have hp : 0 < p := by linarith
  have sp : 0 < sin p := sin_pos_of_pos_of_lt_pi hp (by linarith)
  have sq : 0 < sin q := sin_pos_of_pos_of_lt_pi hq (by linarith)
  have cp : 0 < cos p := cos_pos_of_mem_Ioo ⟨by linarith, hp'⟩
  have cq : 0 < cos q := cos_pos_of_mem_Ioo ⟨by linarith, by linarith⟩
  have spq : 0 < sin (p - q) := sin_pos_of_pos_of_lt_pi (by linarith) (by linarith)
  have h5 : chord C' A = sin (p - q) := by
    rw [chord_eq, show (C' - A) / 2 = p - q by simp only [A, C']; ring, abs_of_pos spq]
  have h1 : chord A π = sin p := by
    rw [chord_eq, show (A - π) / 2 = -p by simp only [A]; ring, sin_neg, abs_neg, abs_of_pos sp]
  have h2 : chord A 0 = cos p := by
    rw [chord_eq, show (A - 0) / 2 = π / 2 - p by simp only [A]; ring, sin_pi_div_two_sub,
      abs_of_pos cp]
  have h3 : chord C' π = sin q := by
    rw [chord_eq, show (C' - π) / 2 = -q by simp only [C']; ring, sin_neg, abs_neg, abs_of_pos sq]
  have h4 : chord C' 0 = cos q := by
    rw [chord_eq, show (C' - 0) / 2 = π / 2 - q by simp only [C']; ring, sin_pi_div_two_sub,
      abs_of_pos cq]
  have h6 : chord π 0 = 1 := by
    rw [chord_eq, show (π - 0) / 2 = π / 2 by ring, sin_pi_div_two, abs_one]
  refine ⟨h5, ?_⟩
  rw [h1, h2, h3, h4, h5, h6, sin_sub]; ring

/-- **Le théorème de Ptolémée**, question 4, the leaf's statement. -/
theorem sine_ratio (p q : ℝ) :
    (sin p * cos q + cos p * sin q) / (sin p * cos q - cos p * sin q) = sin (p + q) / sin (p - q) := by
  rw [sin_add, sin_sub]

/-! ## « Le « très noble théorème » » -/

/-- **Le très noble théorème**, question 1. With `C = (0,0,1)`, `A = (sin b, 0, cos b)`,
`B = (0, sin a, cos a)`: `C · A = cos b`, `C · B = cos a`, the planes of the arcs `CA` and `CB`
(`y = 0` and `x = 0`) are perpendicular, and `A · B = cos a cos b`, which is `cos c`. -/
theorem noble_vectors (a b : ℝ) :
    (0 * sin b + 0 * 0 + 1 * cos b = cos b) ∧ (0 * 0 + 0 * sin a + 1 * cos a = cos a) ∧
    ((0 : ℝ) * 1 + 1 * 0 + 0 * 0 = 0) ∧
    sin b * 0 + 0 * sin a + cos b * cos a = cos a * cos b := by
  refine ⟨by ring, by ring, by ring, by ring⟩

/-- **Le très noble théorème**, question 2. The tangent vectors at `A` are
`C − (cos b) A = sin b (−cos b, 0, sin b)` and `B − (cos c) A`; their dot product is
`sin b · sin b cos a` and their norms `sin b` and `sin c`, so `cos A = cos a sin b / sin c`; with
`cos c = cos a cos b`, `cos A = tan b / tan c`. -/
theorem noble_cosA (a b c : ℝ) (hc : cos c = cos a * cos b) (hb : cos b ≠ 0) (hsc : sin c ≠ 0) :
    -- the tangent vector along `AC`, divided by `sin b`, is a unit vector
    (-cos b) ^ 2 + 0 ^ 2 + sin b ^ 2 = 1 ∧
    -- the tangent vector along `AB` and its squared norm
    (-cos c * sin b) ^ 2 + sin a ^ 2 + (cos a - cos c * cos b) ^ 2 = sin c ^ 2 ∧
    -- the dot product of the unit tangent along `AC` with the tangent along `AB`
    (-cos b) * (-cos c * sin b) + 0 * sin a + sin b * (cos a - cos c * cos b) = sin b * cos a ∧
    cos a * sin b / sin c = (sin b / cos b) / (sin c / cos c) := by
  refine ⟨by nlinarith [sin_sq_add_cos_sq b], ?_, by ring, ?_⟩
  · rw [hc]; nlinarith [sin_sq_add_cos_sq a, sin_sq_add_cos_sq b, sin_sq_add_cos_sq c,
      show cos c ^ 2 = cos a ^ 2 * cos b ^ 2 by rw [hc]; ring]
  · have hcc : cos c ≠ 0 → True := fun _ => trivial
    by_cases hcz : cos c = 0
    · -- then `cos a = 0`, and both sides are `0`
      have ha : cos a = 0 := by
        rcases mul_eq_zero.1 (hc ▸ hcz : cos a * cos b = 0) with h | h
        · exact h
        · exact absurd h hb
      rw [ha, hcz]; simp
    · rw [hc]; field_simp

/-- **Le très noble théorème**, question 3. With `cos A = cos a sin b / sin c`,
`cos c = cos a cos b`, `0 < b, c < π/2` and `cos A < 1`, put `g = sin c cos b`,
`h = cos c sin b`: then `h = g cos A`, `sin(c + b) = g(1 + cos A)`, `sin(c − b) = g(1 − cos A)`,
and the leaf's statement. And `cos c < cos b` gives `c > b` when `0 < a < π/2`. -/
theorem noble_theorem (a b c cosA : ℝ) (hc : cos c = cos a * cos b)
    (hA : cosA = cos a * sin b / sin c) (hb : 0 < b) (hb' : b < π / 2) (hc0 : 0 < c)
    (hc' : c < π) (hA1 : cosA < 1) :
    cos c * sin b = (sin c * cos b) * cosA ∧
    sin (c + b) = sin c * cos b * (1 + cosA) ∧ sin (c - b) = sin c * cos b * (1 - cosA) ∧
    sin (c + b) / sin (c - b) = (1 + cosA) / (1 - cosA) := by
  have hsc : 0 < sin c := sin_pos_of_pos_of_lt_pi hc0 (by linarith)
  have hcb : 0 < cos b := cos_pos_of_mem_Ioo ⟨by linarith, hb'⟩
  have hh : cos c * sin b = (sin c * cos b) * cosA := by
    rw [hA, hc]; field_simp
  have h1 : sin (c + b) = sin c * cos b * (1 + cosA) := by rw [sin_add]; linear_combination hh
  have h2 : sin (c - b) = sin c * cos b * (1 - cosA) := by rw [sin_sub]; linear_combination -hh
  refine ⟨hh, h1, h2, ?_⟩
  rw [h1, h2]
  have hg : sin c * cos b ≠ 0 := (mul_pos hsc hcb).ne'
  have h1A : 1 - cosA ≠ 0 := by linarith
  field_simp

/-- **Le très noble théorème**, question 3: `c > b`. For `0 < a, b, c < π/2` with
`cos c = cos a cos b`, `cos c < cos b`, hence `b < c`. -/
theorem noble_c_gt_b (a b c : ℝ) (hc : cos c = cos a * cos b) (ha : 0 < a) (ha' : a < π / 2)
    (hb : 0 < b) (hb' : b < π / 2) (hc0 : 0 ≤ c) : b < c := by
  have hcb : 0 < cos b := cos_pos_of_mem_Ioo ⟨by linarith, hb'⟩
  have hca : cos a < 1 := by
    rw [← cos_zero]; exact cos_lt_cos_of_nonneg_of_le_pi_div_two le_rfl (by linarith) ha
  have : cos c < cos b := by rw [hc]; nlinarith
  by_contra h
  have h' := not_lt.1 h
  have : cos b ≤ cos c := cos_le_cos_of_nonneg_of_le_pi hc0 (by linarith) h'
  linarith

/-- **Le très noble théorème**, question 4. `(1 + cos A)/(1 − cos A) = cot²(A/2)`, the form of
proposition XVI. -/
theorem noble_cot_sq (A : ℝ) (hA : sin (A / 2) ≠ 0) :
    (1 + cos A) / (1 - cos A) = (cos (A / 2) / sin (A / 2)) ^ 2 := by
  have e : A = 2 * (A / 2) := by ring
  have h1 : 1 + cos A = 2 * cos (A / 2) ^ 2 := by
    conv_lhs => rw [e]
    rw [cos_two_mul]; ring
  have h2 : 1 - cos A = 2 * sin (A / 2) ^ 2 := by
    conv_lhs => rw [e]
    rw [cos_two_mul]; nlinarith [sin_sq_add_cos_sq (A / 2)]
  rw [h1, h2]
  field_simp

end Germain.Exercises.Maurolico
