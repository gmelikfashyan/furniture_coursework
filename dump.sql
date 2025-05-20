--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    listing_id integer,
    buyer_id integer,
    seller_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chats_id_seq OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- Name: images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.images (
    id integer NOT NULL,
    listing_id integer,
    image_url character varying(255) NOT NULL,
    is_primary boolean DEFAULT false
);


ALTER TABLE public.images OWNER TO postgres;

--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.images_id_seq OWNER TO postgres;

--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    year integer NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    location character varying(255) NOT NULL,
    lat double precision,
    lng double precision,
    user_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    address character varying(100) DEFAULT 'ул. Ворошилова, 154'::character varying,
    model_url character varying(255)
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listings_id_seq OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    chat_id integer,
    sender_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    phone character varying(20),
    role character varying(20) DEFAULT 'user'::character varying,
    name character varying(20) DEFAULT 'Александр'::character varying,
    surname character varying(20) DEFAULT 'Федоров'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- Name: images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, listing_id, buyer_id, seller_id, created_at) FROM stdin;
1	1	3	2	2025-05-16 18:52:40.938994
2	3	4	2	2025-05-16 18:52:40.938994
3	6	2	3	2025-05-16 18:52:40.938994
4	2	5	3	2025-05-18 18:56:21.301304
5	1	5	2	2025-05-18 22:54:00.713737
6	15	6	5	2025-05-18 23:42:57.075403
7	16	6	5	2025-05-20 17:17:47.223381
\.


--
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.images (id, listing_id, image_url, is_primary) FROM stdin;
11	1	https://example.com/images/sofa_milan.jpg	t
12	1	https://example.com/images/sofa_milan_2.jpg	f
13	2	https://example.com/images/table_olimp.jpg	t
14	3	https://example.com/images/wardrobe_3doors.jpg	t
15	3	https://example.com/images/wardrobe_inside.jpg	f
16	4	https://example.com/images/bed_grand.jpg	t
17	5	https://example.com/images/chair_boss.jpg	t
18	5	https://example.com/images/chair_boss_2.jpg	f
19	6	https://example.com/images/living_room_set.jpg	t
20	6	https://example.com/images/living_room_set_2.jpg	f
21	15	/uploads/1747591896159.jpg	t
22	16	/uploads/1747684766233.webp	t
23	16	/uploads/1747684766234.webp	f
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, title, type, year, description, price, location, lat, lng, user_id, is_active, created_at, address, model_url) FROM stdin;
1	Угловой диван "Милан"	Диван	2022	Новый, кожзам, бежевый цвет, механизм "еврокнижка"	45000.00	Москва	55.7558	37.6176	2	t	2025-05-16 18:52:40.938994	ул. Ворошилова, 154	\N
2	Обеденный стол "Олимп"	Стол	2021	Стеклянная столешница, хромированные ножки, диаметр 120 см	28000.00	Санкт-Петербург	59.9343	30.3351	3	t	2025-05-16 18:52:40.938994	ул. Ворошилова, 154	\N
3	шкаф-купе 3-створчатый	шкаф	2020	Система "Командор", зеркальные двери, высота 240 см	32000.00	Казань	55.7961	49.1064	2	t	2025-05-16 18:52:40.938994	ул. Ворошилова, 154	\N
4	Кровать двуспальная "Гранд"	Кровать	2023	С подъемным механизмом, ящики для белья, цвет "венге"	37000.00	Новосибирск	55.0084	82.9357	4	t	2025-05-16 18:52:40.938994	ул. Ворошилова, 154	\N
5	Компьютерное кресло "Босс"	Кресло	2022	Ортопедическая спинка, подголовник, регулировка высоты	12500.00	Екатеринбург	56.8389	60.6057	3	t	2025-05-16 18:52:40.938994	ул. Ворошилова, 154	\N
6	Гарнитур для гостиной	Мебельный гарнитур	2021	3 предмета: стенка, тумба, витрина, цвет "дуб сонома"	89000.00	Москва	55.7558	37.6176	2	t	2025-05-16 18:52:40.938994	ул. Ворошилова, 154	\N
15	sfefsef	ewfsef	2019	sdfdsvcdscvdcvdsc	1800.00	Апшеронск	55.6614	37.477	5	t	2025-05-18 21:11:36.164973	ул. Ворошилова,10	\N
16	Кухонный стул с черными ножками желтый	Стул	2019	Стул, каркас и сидушка которого выполнены из металла, отличается повышенной прочностью. Сидушка со спинкой обиты отличным текстилем нескольких цветов на выбор.\r\nСтул DC-350 желтый/черный станет украшением любого помещения. Его можно установить как на кухне, так и в гостиной, столовой или спальне.\r\nСочетание лаконичного дизайна и роскошного цвета делает стул подходящим как для современных, так и классических интерьеров. Множество цветовых решений позволяют подбирать стулья под цвет мебели, стен или декора.	2698.00	Апшеронск	55.6614	37.477	5	t	2025-05-19 22:59:26.294343	ул. Ворошилова,168	/uploads/1747684766234.glb
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, chat_id, sender_id, message, is_read, created_at) FROM stdin;
1	1	3	Здравствуйте, диван еще доступен?	f	2025-05-16 18:52:40.938994
2	1	2	Да, в наличии. Можете посмотреть сегодня	f	2025-05-16 18:52:40.938994
3	1	3	Какой график работы?	f	2025-05-16 18:52:40.938994
4	2	4	Шкаф сборный или готовый?	f	2025-05-16 18:52:40.938994
5	2	2	Готовый, сборка включена в цену	f	2025-05-16 18:52:40.938994
6	3	2	Можно ли купить гарнитур по частям?	f	2025-05-16 18:52:40.938994
7	3	3	Только комплектом, цена фиксированная	f	2025-05-16 18:52:40.938994
8	4	\N	Здравствуйте, продаёте диван?	f	2025-05-18 23:25:53.880006
9	5	\N	Здравствуйте	f	2025-05-18 23:29:11.289493
10	5	\N	sfesfe	f	2025-05-18 23:30:24.726738
11	5	\N	dscfdc	f	2025-05-18 23:32:22.495645
12	5	\N	sadfsdfc	f	2025-05-18 23:33:30.640781
13	5	\N	scdcvd	f	2025-05-18 23:34:00.858564
14	5	5	asvdvc	f	2025-05-18 23:34:43.186284
15	5	5	sfdsvse	f	2025-05-18 23:34:57.941777
16	5	5	Че ты, леее, вацалик	f	2025-05-18 23:36:09.036188
17	4	5	Ассаламу Алейкум, брат	f	2025-05-18 23:39:09.787651
18	6	6	Салам, брат	t	2025-05-18 23:43:15.053169
19	6	5	мпранаапнппрапраппапппппппппп	t	2025-05-18 23:50:19.94923
20	7	6	Добрый день, хочу приобрести, когда можно подъехать	f	2025-05-20 17:18:48.727774
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, username, phone, role, name, surname) FROM stdin;
1	admin@example.com	$2a$10$xJwL5v5Jz7U6QbZ5X8b.3eJjK9lN1rFv8W9yC0d3mJkL5nV2pW7r6	Администратор	777777777	admin	Александр	Федоров
2	user1@example.com	$2a$10$yH8eJ3mK5tR7vU9wX2b.4fNlP6oQ8rS9tA0b1c2d3e4f5g6h7i8j9	Иван Иванов	777777777	user	Александр	Федоров
3	user2@example.com	$2a$10$zI9k4lM7nO8pQ0rS2tU3vW5xY6zA1B2C3d4e5f6g7h8i9j0k1l2m3	Петр Петров	777777777	user	Александр	Федоров
4	user3@example.com	$2a$10$aB1c2D3e4F5g6H7i8J9k0L1m2N3o4P5q6R7s8t9u0v1w2x3y4z5	Мария Сидорова	777777777	user	Александр	Федоров
5	gmelikfashyan@gmail.com	$2b$10$mb1ug4GXlr8y3/wiEte8xu9GP70XmAYjhNUZ/L/zIRyDU5gxM9t3a	Gevo123		user	Геворк	Меликфашян
6	gevork.melikfashyan@gmail.com	$2b$10$n5S9LrLCW9AVKfUAI/QsjO522uXNda30HQwPPeKKCa/S3IDOv8nqG	Андрей Елисеев		user	Андрей	Елисеев
\.


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_id_seq', 7, true);


--
-- Name: images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.images_id_seq', 23, true);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.listings_id_seq', 17, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_chats_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chats_buyer_id ON public.chats USING btree (buyer_id);


--
-- Name: idx_chats_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chats_listing_id ON public.chats USING btree (listing_id);


--
-- Name: idx_chats_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chats_seller_id ON public.chats USING btree (seller_id);


--
-- Name: idx_images_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_images_listing_id ON public.images USING btree (listing_id);


--
-- Name: idx_listings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_user_id ON public.listings USING btree (user_id);


--
-- Name: idx_messages_chat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_chat_id ON public.messages USING btree (chat_id);


--
-- Name: idx_messages_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);


--
-- Name: chats chats_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chats chats_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: chats chats_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: images images_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listings listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

