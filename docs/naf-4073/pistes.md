# NAF 4073: leads kept out of the article

Set aside on 26 November 2026, to keep the short article on one line (the note, its attribution, the computation it extends). Each item was checked numerically when noted; none is claimed as new.

- **Matrices of the two systems.** Odd: `D t = A s` with `A[k][i] = C(k, 2(k−i)+1)`; even: `B[k][i] = C(k, 2(k−i)) + 2 C(k, 2(k−i)+1)`. Both are in Edwards 1986 (F and G) after Tits 1923; A is OEIS A109447/A034867. Column sums: A gives Fibonacci F(2i), B gives Lucas L(2i+1) (from the shallow-diagonal identity of Pascal's triangle; not seen in Edwards).
- **Divisibility by T²** of the odd sums from the first column of A: in Edwards 1986.
- **Irreducibility of the reduced factors** `S_{2k−1}/T²` and `S_{2k}/((2n+1)T)`: irreducible over Q for p ≤ 32 (tested mod primes), except S₉ and S₁₀, which share the factor 2T − 1, i.e. the root n = 1/φ = (√5 − 1)/2. Compare Brillhart (1969) and Inkeri on Bernoulli polynomials before saying more.
- **Primality of S_p(n).** Odd p ≥ 3, n ≥ 2: composite (T_n divides S_p). n = 2: S_p(2) = 1 + 2^p, prime only for the Fermat primes 3, 5, 17, 257, 65537. Even p, n ≥ 3: no prime for p ≤ 16, n < 40; a proof needs a bound on what the denominator of S_{2k} = (2n+1) T R(T)/D can absorb.
- **Weighted sums and primes.** 2T_n + 1 = n² + n + 1, T_n + 1: irreducible, Bunyakovsky-type; infinitely many prime values is open (Landau's n² + 1 problem).
- **Complex p.** S_p(n) = ζ(−p) − ζ(−p, n+1); Euler–Maclaurin; ζ(−1) = −1/12 (the joke formerly in appendix B).
- **Symmetry n ↦ −1 − n** (Knuth's reflection): explains why odd sums are polynomials in T and even sums (2n+1) times one; centred variable u = n + 1/2.
- **Hexagonal numbers.** H_n = T_{2n−1}, so 1³ + … + (2n−1)³ = H_n²; centred hexagonal numbers sum to cubes.
- **Lean.** Proposition « S_{2k} = S₂ R_k(S₁) » is proved in Lean only for k ≤ 4; the general case needs a polynomial existence statement.
