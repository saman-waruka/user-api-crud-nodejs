CREATE SEQUENCE user_id_seq;

CREATE TABLE public.users
(
    id integer DEFAULT nextval('users_id_seq'::regclass),
    name character varying(255) NOT NULL,
	lastname character varying(255) NOT NULL,
    profile jsonb,
    created_at timestamp without time zone DEFAULT (now())::timestamp without time zone,
    updated_at timestamp without time zone,
    softdelete boolean DEFAULT false,
    PRIMARY KEY (id)
)