-- Single-document Cowshi book (users, admins, markets, orders, positions, trades).
create table if not exists cowshi_store (
  id integer primary key,
  version bigint not null default 0,
  data jsonb not null
);
