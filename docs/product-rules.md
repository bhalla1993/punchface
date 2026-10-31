# Product rules

Locked on 31 October 2026. These are the rules of play. Hosting and cost are in the [stack](stack.md).

## The face

There is one face for the whole world.

The maker chooses it from the bench and puts it up by redeploying. There is no admin site. Visitors cannot add a person.

The face stays up while people are punching. When the count goes quiet, the maker decides to swap it and redeploys the next face. Nothing swaps it on a timer. A face may stay for days or longer, and a past face may be used again later.

The page says this in one line: **The face is chosen by the site and replaced when punching slows.**

Swapping the face clears the weekly country scores. The all-time country scores stay.

## Countries

Twenty-three countries are rows on the board. Visitors from anywhere else are one more row, Rest of world.

| Country |
| --- |
| Argentina |
| Australia |
| Bangladesh |
| Brazil |
| Canada |
| China |
| France |
| Germany |
| India |
| Indonesia |
| Italy |
| Japan |
| Mexico |
| Nigeria |
| Pakistan |
| Philippines |
| Russia |
| Saudi Arabia |
| South Africa |
| South Korea |
| Türkiye |
| United Kingdom |
| United States |
| Rest of world |

A visitor in one of the twenty-three scores for that country. Everyone else scores for Rest of world. Country comes from Cloudflare’s country header. The visitor cannot move their punches onto another country.

## Punches

One tap adds one punch to the visitor’s country, on the weekly board and the all-time board.

A combo, a shake, or any other hit effect stays on the device. It does not change the number of punches.

## Daily allowance

An address can add 500 punches per UTC day.

Until that number is reached, each tap adds one for that visitor’s country.

After it is reached, the face still reacts. Those taps do not change either board. The line under the face reads: **You can keep punching for fun. These no longer add to the count.**

The allowance returns on the next UTC day. It is tied to the address because there is no account. Extra punches cannot be bought in MVP1.

## Boards

The weekly board is the main board. It ranks the countries by punches during the current week. Bigger countries will usually lead, because more people can show up. That is the race.

The all-time board ranks the same countries by every punch they have landed, across every face. It is visible beside the weekly board, or one action away.

The visitor’s own country stays on screen even when it is outside the leading rows.

When two countries have the same weekly score, they stay in the order listed above.

## The week

The race uses one clock for the whole world. A week starts Monday at 12:00 AM UTC and ends Sunday at 11:59 PM UTC.

At Monday 12:00 AM UTC, weekly country scores return to zero. The face does not change because the week turned. All-time scores stay as they are.

## Sharing

A link opens the current face. Punches from that screen still count for the visitor’s own country.
