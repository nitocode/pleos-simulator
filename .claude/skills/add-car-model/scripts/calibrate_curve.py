"""Calibre une courbe de charge rapide (CC) sur une durée 10→80 % sourcée.

Usage :
  python calibrate_curve.py --kwh 77 --target 28 --curve "0:100,10:175,50:118,80:68,100:8"

Affiche la durée 10→80 % (et 0→100 %) obtenue par intégration, comme src/core/vehicle/simulation.ts
(chargeMinutes), puis, si l'écart dépasse --tolerance minutes, une courbe dont les puissances au-delà de
10 % sont mises à l'échelle pour atteindre la cible (le pic à 10 % est conservé).
"""
import argparse
import sys

# Console Windows : forcer l'UTF-8 pour les flèches et accents.
sys.stdout.reconfigure(encoding='utf-8')


def parse(curve: str):
    pts = []
    for part in curve.split(','):
        soc, kw = part.split(':')
        pts.append((float(soc), float(kw)))
    pts.sort()
    if pts[0][0] != 0 or pts[-1][0] != 100:
        raise SystemExit('La courbe doit commencer à 0 % et finir à 100 %.')
    return pts


def power(pts, soc):
    soc = min(100.0, max(0.0, soc))
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= soc <= x1:
            return y0 + (y1 - y0) * (soc - x0) / (x1 - x0)
    return pts[-1][1]


def minutes(pts, kwh, a, b, step=0.1):
    t, s = 0.0, a
    while s < b - 1e-9:
        t += step / 100 * kwh / power(pts, s + step / 2) * 60
        s += step
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--kwh', type=float, required=True, help='capacité nette (kWh)')
    ap.add_argument('--target', type=float, required=True, help='durée 10→80 %% sourcée (min)')
    ap.add_argument('--curve', required=True, help='points "soc:kW,..." de 0 à 100')
    ap.add_argument('--tolerance', type=float, default=0.5)
    args = ap.parse_args()

    pts = parse(args.curve)
    got = minutes(pts, args.kwh, 10, 80)
    print(f'10→80 % : {got:.1f} min (cible {args.target} min) · 0→100 % : {minutes(pts, args.kwh, 0, 100):.1f} min')
    if abs(got - args.target) <= args.tolerance:
        print('OK : courbe dans la tolérance.')
        return
    # La mise à l'échelle ne dépasse jamais le pic d'origine (la puissance max sourcée).
    peak = max(kw for _, kw in pts)
    lo, hi = 0.3, 3.0
    for _ in range(60):
        k = (lo + hi) / 2
        scaled = [(s, kw if s <= 10 else min(peak, kw * k)) for s, kw in pts]
        if minutes(scaled, args.kwh, 10, 80) > args.target:
            lo = k
        else:
            hi = k
    scaled = [(s, round(kw if s <= 10 else min(peak, kw * k))) for s, kw in pts]
    print(f'Facteur {k:.3f} → {minutes(scaled, args.kwh, 10, 80):.1f} min')
    print('dcCurve: [' + ', '.join(f'[{int(s)}, {kw}]' for s, kw in scaled) + ']')


if __name__ == '__main__':
    main()
