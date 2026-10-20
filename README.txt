# Patch: services and amenities badges — R8.8.16-shop-service-badges

Source: talad-kratumbaen-test-main (10).zip (root website version)

## Included files
- app.js — connect existing service fields to public shop detail, all-shop cards and recommended cards.
- styles.css — small red-brand responsive badges.
- index.html — cache-bust updated app.js and styles.css; all existing content preserved.
- sw.js — change cache name and pre-cache versions ONLY; keep service-worker logic unchanged.

## Behavior
- Detail modal: show ALL selected service/amenity flags, hide entire block when none selected.
- Shop list cards: show up to 3 selected flags, compact layout.
- Recommended cards: show up to 2 selected flags.
- No flags changed or saved differently. No Supabase schema/SQL changes.
- No order, payment, Rider, Push, or permissions changes.
- Delivery service tick is informational only; it does NOT enable KTB project delivery orders.
- LINE MAN / Grab / ShopeeFood labels are informational; their buttons still require URL as before.

## Upload
1. Back up the 4 original ROOT files app.js styles.css index.html sw.js in the repository.
2. Replace ONLY these 4 files at website repository ROOT (not inside /test or /rider).
3. Deploy as usual. Refresh website and reopen after SW update; test desktop and mobile.
4. Open a shop with checked services and confirm details/list card and recommendation card.
5. Open a shop without selected services and verify no empty box appears.
6. Confirm order / rider / alerts still work unchanged (smoke test; not performed here).

## Rollback
Restore the backed-up 4 files; deployed service-worker cache name will revert accordingly.

## Verification done
- Source file references and select * details checked statically.
- JS syntax checked with node --check; CSS and HTML file unchanged outside styles links.
- No live production test conducted.
