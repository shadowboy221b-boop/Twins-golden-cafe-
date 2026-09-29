/**
 * Who the office belongs to.
 *
 * The uid below decides what the page *offers*: the owner sees the customer
 * book and the orders, the counter device sees only attendance. It is not
 * what keeps anyone out — the rules on the database do that, and they name
 * the same account. Hiding a tab is a courtesy; the lock is elsewhere.
 *
 * Changing the owner means changing it here and in firestore.rules.
 */
export const OWNER_UID = "JibLn5BbudMZwOfJKmzDVe8Jb3h1";
