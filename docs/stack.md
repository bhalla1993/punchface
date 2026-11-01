# Stack and cost

Locked on 31 October 2026.

MVP1 runs on Cloudflare’s free plan. A promoted launch week uses the paid plan, as described in [launch](launch.md). Any other paid month is a later choice.

## Where it runs

One Cloudflare account, with no payment method on it.

The page, the script, and the cartoon stills are static files on Cloudflare Workers. Requests for those files are free. The worker runs only for the punch and leaderboard API. The setting that runs the worker before every file stays off.

One Durable Object holds the weekly and all-time country scores. Each counted punch is written to storage before the reply is sent. The object can sleep when nobody is playing, and those scores stay. It does not keep punches in memory to save later, and it does not use a timer that stays awake.

A daily job at 00:05 UTC deletes address allowances from earlier days. If the Monday date has changed, that job also sets weekly scores back to zero. A punch or a board load does the same check, so the week does not wait for the job. The job does not change the face. The maker changes the face by replacing the cartoon and redeploying. There is no admin site. That redeploy clears the weekly scores.

The visitor’s country comes from Cloudflare’s country header. There is no separate geo service.

A punch request includes a Cloudflare Turnstile token. Turnstile is free. A request without a valid token does not change a score.

The phone groups taps and sends them in batches. A hidden tab stops sending.

## What is not in the stack

These stay out. Each one is another bill.

- Redis or any other database host
- Cloudflare R2, KV, D1, and Images
- A paid firewall or rate-limit product
- Analytics products beyond Cloudflare’s free dashboard
- A payment method, until a month when the maker chooses the paid plan

Scores are a small set of numbers in the Durable Object. They can be exported. The cartoons stay in this repo. The domain can move later.

## The daily punch allowance

This is also a product rule. An address can add 500 punches per UTC day, for their own country.

Punch 501 and after still play on the phone. They do not change the weekly or all-time board. The line under the face reads: **You can keep punching for fun. These no longer add to the count.**

The allowance is per address because MVP1 has no accounts. People who share a network share that allowance. Selling more punches is out of MVP1.

## When the free plan is full

The free plan allows 100,000 API requests per UTC day. After that, Cloudflare stops the API and the charge stays $0. The page and the cartoons keep loading.

While the API is stopped, the face still reacts on the phone and the shared count does not move. It resumes when the free allowance returns.

## Money

| Piece | Cost |
| --- | --- |
| Cloudflare Workers, free plan | $0. The API stops at the daily allowance instead of billing more |
| Workers Paid, for a promoted launch week or any later month the maker chooses | $5 for that month, then usage beyond the included amount. A card is added only for that choice. Ko-fi tips can cover it. The everyday site can stay on the free plan |
| Domain | Budget $20 for the year. Check the renewal price before buying. Keep auto-renew on |
| Ko-fi | $0. A footer link. No embed |

No ads. Ko-fi is a tip toward hosting. It is not a punch shop.
