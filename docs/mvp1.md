# MVP1

Locked on 31 October 2026.

MVP1 is the first public version of the product in [the brief](product-brief.md), played by the [rules](product-rules.md), with a face that meets the [content spec](content-spec.md).

## In the first version

- One worldwide face at a time, one cartoon still
- 23 countries on the board, plus Rest of world
- Punches count for the visitor’s own country
- One tap equals one punch, up to 500 counted punches per address per UTC day
- After 500, the face still punches, the count does not move, and the allowance message is shown
- A weekly country leaderboard as the main board
- An all-time country leaderboard beside it
- The visitor’s country stays visible when it is outside the leading rows
- The weekly scores reset every Monday at 12:00 AM UTC, even if the face stays
- The face stays up while punching is active, and changes only when the maker redeploys a new one
- A one-line disclaimer that the site chooses the face and replaces it when punching slows
- English interface
- Footer link to Ko-fi
- Sound off until the visitor enables it
- A shareable link to the current face

## Out of the first version

These were considered and set aside. They are not open product questions.

| Item | Where it stands |
| --- | --- |
| Five faces in every country | Out. The world shares one face |
| A switcher that assigns punches to a country the visitor picks | Out. Country comes from where the visitor is |
| A new face forced every Monday | Out. Monday resets the race. The face changes when punching slows |
| Loved athletes and other widely adored public figures | Out. The face has to be punchable |
| Vote among nominees for the next face | Later |
| A history of past faces | Later |
| Ranking countries by population or punches per person | Out. The board is raw punches |
| Visitors suggesting or adding a person | Later |
| Accounts, ads, and a paywall | Out |
| Selling extra punches after the daily allowance | Out |
| More than one stored image per face | Out. Motion is part of the interface |

## Work order

Hosting and cost are locked in the [stack](stack.md). The launch shape is locked in [launch](launch.md).

1. **Product and stack lock.** This set of documents.
2. **Bench.** The [bench](roster.md) has a working list of 25 names. Update it from the news before a face goes live. It is the pool for the year, not a face for every week.
3. **First cartoon.** Approve one still of the first face. Later faces follow that style.
4. **Build.** Build only what MVP1 and the stack list.
5. **Launch.** Follow the launch page. Turn on the paid Workers month before a week you are going to promote.

## Definition of done

MVP1 is ready to show when a stranger can do all of this on a phone:

- See one face immediately and punch it
- See that punch add one to their own country, until the daily allowance is used
- After the allowance, keep punching and see that those hits do not change the board
- Read which countries are ahead this week, and see their own country even if it is not leading
- Read the all-time country order
- Read the disclaimer about why the face is there and when it can change
- Open a shared link and land on the current face
- Reach Ko-fi from the footer without a popup

Behind that visit:

- The first face is chosen from the bench and drawn
- Weekly country scores clear on Monday at 12:00 AM UTC
- All-time country scores do not clear
- Replacing the face clears the weekly board and leaves the all-time board
- No account is required
