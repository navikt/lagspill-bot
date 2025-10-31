export function plasseringEmoji(i: number): string {
    switch (i) {
        case 0:
            return ':first_place_medal:'
        case 1:
            return ':second_place_medal:'
        case 2:
            return ':third_place_medal:'
        default:
            return ''
    }
}
