--
-- PostgreSQL database dump
--

\restrict rXsriVoQCfDPaM9SHjmqjaD0mPCjxdYLAk7OrRfTLOtD79TEKw17RtDSggp2SFa

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: Item; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."Item" (
    id text NOT NULL,
    name text NOT NULL,
    price numeric(65,30) DEFAULT 0 NOT NULL,
    group_id text NOT NULL,
    is_disable boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Item" OWNER TO cafe_admin;

--
-- Name: ItemGroup; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."ItemGroup" (
    id text NOT NULL,
    name text NOT NULL,
    is_disable boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ItemGroup" OWNER TO cafe_admin;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Notification" OWNER TO cafe_admin;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    reservation_id text NOT NULL,
    item_id text NOT NULL,
    item_price numeric(65,30) DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    accepted boolean DEFAULT false NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Order" OWNER TO cafe_admin;

--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    number integer NOT NULL,
    date_time timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    client_name text NOT NULL,
    phone text NOT NULL,
    room_id text NOT NULL,
    accepted boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    activated boolean DEFAULT false NOT NULL,
    order_passkey integer NOT NULL,
    rejected boolean DEFAULT false NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Reservation" OWNER TO cafe_admin;

--
-- Name: Reservation_number_seq; Type: SEQUENCE; Schema: public; Owner: cafe_admin
--

CREATE SEQUENCE public."Reservation_number_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reservation_number_seq" OWNER TO cafe_admin;

--
-- Name: Reservation_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cafe_admin
--

ALTER SEQUENCE public."Reservation_number_seq" OWNED BY public."Reservation".number;


--
-- Name: Room; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."Room" (
    id text NOT NULL,
    name text NOT NULL,
    is_disable boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    qr_code text NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Room" OWNER TO cafe_admin;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."Settings" (
    id text NOT NULL,
    currency_name text DEFAULT 'YER'::text NOT NULL,
    notification_threshold integer DEFAULT 100 NOT NULL,
    app_lang text DEFAULT 'ar'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "force_client_order_session_passKey" boolean DEFAULT false NOT NULL,
    per_page integer DEFAULT 25 NOT NULL,
    session_expiry_minutes integer DEFAULT 30 NOT NULL
);


ALTER TABLE public."Settings" OWNER TO cafe_admin;

--
-- Name: User; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    is_disable boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO cafe_admin;

--
-- Name: UserSession; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public."UserSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserSession" OWNER TO cafe_admin;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: cafe_admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO cafe_admin;

--
-- Name: Reservation number; Type: DEFAULT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Reservation" ALTER COLUMN number SET DEFAULT nextval('public."Reservation_number_seq"'::regclass);


--
-- Data for Name: Item; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."Item" (id, name, price, group_id, is_disable, created_at, updated_at) FROM stdin;
7a3a2a48-317b-492d-baff-d5e04bf8957f	قهوة عربي صغير	150.000000000000000000000000000000	929e12f5-f6ce-47c7-80e3-a6273095ea2b	f	2026-05-25 14:37:11.214	2026-05-25 14:37:11.214
131ce9e7-3dd3-41c3-b376-afe7279e58ab	شاي احمر صغير	100.000000000000000000000000000000	929e12f5-f6ce-47c7-80e3-a6273095ea2b	f	2026-05-25 14:40:08.96	2026-05-25 14:40:08.96
4321561b-deea-4c4a-84ac-4d862815832a	شاي حليب عدني صغير	200.000000000000000000000000000000	929e12f5-f6ce-47c7-80e3-a6273095ea2b	f	2026-05-25 14:40:42.392	2026-05-25 14:40:42.392
953cf0cd-fdf3-41cc-836c-e3c15eafa23a	قهوة باردة	300.000000000000000000000000000000	112123ba-c061-4c3e-8f99-ac35cc5ee767	t	2026-05-25 14:39:40.234	2026-05-25 14:40:53.747
5f72f7bc-8302-40a3-bc4a-e4db943a54b4	بيبسي رمان صغير	200.000000000000000000000000000000	36596742-1073-4fc9-a7be-7d6be544b579	f	2026-05-25 14:48:36.988	2026-05-25 14:48:36.988
031ba118-f9da-45b5-9d3d-822d3c3ed181	كندا حمراء كبير	250.000000000000000000000000000000	36596742-1073-4fc9-a7be-7d6be544b579	f	2026-05-25 18:13:58.328	2026-05-25 18:13:58.328
70f9622a-9090-4500-81da-ba931e50c09f	كندا سوداء كبير	250.000000000000000000000000000000	36596742-1073-4fc9-a7be-7d6be544b579	f	2026-05-25 18:14:30.434	2026-05-25 18:14:30.434
7adc1011-b9b5-43f3-a151-c02c04566f28	ايس كريم نانا ابو عودي	100.000000000000000000000000000000	5d66a57d-40bb-4495-87bf-48e5de5f3687	f	2026-05-25 18:14:59.322	2026-05-25 18:14:59.322
407d77d3-61f5-4302-934d-d4d915757f03	ايس كريم نانا شعله	150.000000000000000000000000000000	5d66a57d-40bb-4495-87bf-48e5de5f3687	f	2026-05-25 18:15:19.289	2026-05-25 18:15:19.289
88282401-3bee-4d36-b7a9-7a83c31da470	ايس كريم قلص	100.000000000000000000000000000000	5d66a57d-40bb-4495-87bf-48e5de5f3687	f	2026-05-25 18:15:32.128	2026-05-25 18:15:32.128
74a1d7c6-f339-4a62-bf66-7741ef2ed1bf	ايس كريم مثلوج	50.000000000000000000000000000000	5d66a57d-40bb-4495-87bf-48e5de5f3687	f	2026-05-25 18:15:52.138	2026-05-25 18:15:52.138
\.


--
-- Data for Name: ItemGroup; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."ItemGroup" (id, name, is_disable, created_at, updated_at) FROM stdin;
929e12f5-f6ce-47c7-80e3-a6273095ea2b	مشروبات ساخنة	f	2026-05-25 14:19:03.728	2026-05-25 14:19:03.728
112123ba-c061-4c3e-8f99-ac35cc5ee767	مشروبات باردة	f	2026-05-25 14:19:09.452	2026-05-25 14:19:09.452
6b44e301-0fa1-4d70-9253-e3ee534a225f	عصير	f	2026-05-25 14:19:16.228	2026-05-25 14:19:16.228
36596742-1073-4fc9-a7be-7d6be544b579	بيبسي	f	2026-05-25 14:19:27.626	2026-05-25 14:19:27.626
5d66a57d-40bb-4495-87bf-48e5de5f3687	حلويات	f	2026-05-25 14:19:42.92	2026-05-25 14:19:42.92
e3ac87ed-3db4-49d5-84b3-96ccb241f8f4	فواكه	t	2026-05-25 14:19:48.296	2026-05-25 14:25:36.358
aada1a00-c933-4a0e-b629-be941e056b7b	بسكويت	t	2026-05-25 14:19:21.701	2026-05-25 14:25:44.603
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."Notification" (id, title, message, created_at, read) FROM stdin;
c42b5445-2501-4aad-9906-8a350e315194	طلب جديد	يوجد طلب جديد للغرفة رقم 'مجلس 3'	2026-05-25 18:30:36.805	t
c15e5c41-df44-41ba-b755-0f89d9ab23d4	طلب جديد	يوجد طلب جديد للغرفة رقم 'مجلس 3'	2026-05-25 18:30:34.532	t
cd8830ee-6289-45e3-8bc1-71654e372250	طلب جديد	يوجد طلب جديد للغرفة رقم 'مجلس 3'	2026-05-25 18:31:07.494	t
5e964088-447b-4513-80eb-72ce2c11b52d	طلب جديد	يوجد طلب جديد للغرفة رقم 'مجلس 3'	2026-05-25 18:47:21.461	t
175b57b6-2707-4852-a93d-df95ea06bd79	إلغاء طلب	تم إلغاء طلب 'شاي احمر صغير' للغرفة 'مجلس 3'	2026-05-25 18:31:42.082	t
a9548c46-ae71-460d-a8c1-c7bba93b49c2	إلغاء طلب	تم إلغاء طلب 'بيبسي رمان صغير' للغرفة 'مجلس 3'	2026-05-25 18:47:54.148	t
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."Order" (id, reservation_id, item_id, item_price, quantity, created_at, accepted, updated_at) FROM stdin;
b31514d7-48ed-42c7-8bf5-090c43224a1e	9706b869-c927-4afd-8191-8b3e5748cb48	7a3a2a48-317b-492d-baff-d5e04bf8957f	150.000000000000000000000000000000	1	2026-05-25 18:31:07.48	t	2026-05-25 18:31:27.838
d13075d8-dd59-4108-b192-ecc99b0bcc2f	9706b869-c927-4afd-8191-8b3e5748cb48	7a3a2a48-317b-492d-baff-d5e04bf8957f	150.000000000000000000000000000000	2	2026-05-25 18:30:36.793	t	2026-05-25 18:31:29.277
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."Reservation" (id, number, date_time, client_name, phone, room_id, accepted, created_at, completed, activated, order_passkey, rejected, updated_at) FROM stdin;
9706b869-c927-4afd-8191-8b3e5748cb48	1	2026-05-25 00:00:00	ماجد البعداني	771225616	f0cfe80c-8a95-4f4e-8fee-586724875272	t	2026-05-25 18:18:14.808	f	t	787037	f	2026-05-26 10:37:45.56
7c2e7d9f-9423-40a2-85e0-31e4459543c1	2	2026-05-26 00:00:00	محمد عباس	774398081	e38b05f6-d4d6-4f9e-809f-3440cf7c3bb5	t	2026-05-26 13:28:39.502	f	f	485044	f	2026-05-26 22:18:38.593
\.


--
-- Data for Name: Room; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."Room" (id, name, is_disable, created_at, qr_code, updated_at) FROM stdin;
4401161a-c5a1-4d20-93af-e873a5498c8b	غرفة 1	f	2026-05-25 13:21:57.389	room-416	2026-05-25 13:21:57.389
8ee0c9ca-4311-4890-a46e-b032bdffd108	غرفة 2	f	2026-05-25 13:22:04.709	room-287	2026-05-25 13:22:04.709
14337f42-8ee0-4b08-8fe0-28a1db51590a	غرفة 3	t	2026-05-25 13:22:10.528	room-908	2026-05-25 14:04:01.225
88d60a4d-0ca0-4104-ba79-91bd127981e7	غرفة 4	f	2026-05-25 13:58:03.763	room-260	2026-05-25 14:15:55.997
bca8be96-8984-4e43-94bc-5bf17c08e547	غرفة 5	f	2026-05-25 14:17:29.942	room-701	2026-05-25 14:17:29.942
e38b05f6-d4d6-4f9e-809f-3440cf7c3bb5	غرفة 6	f	2026-05-25 14:17:34.248	room-367	2026-05-25 14:17:34.248
29cb9b77-b44a-4cba-bf36-6f77ef508cb6	مجلس 1	f	2026-05-25 14:17:37.787	room-428	2026-05-25 14:17:37.787
f0cfe80c-8a95-4f4e-8fee-586724875272	مجلس 3	f	2026-05-25 14:17:48.146	room-401	2026-05-25 14:17:48.146
ea7995ae-a868-4994-8e4c-bc27e890b539	مجلس 2	t	2026-05-25 14:17:43.225	room-130	2026-05-25 14:18:45.331
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."Settings" (id, currency_name, notification_threshold, app_lang, created_at, updated_at, "force_client_order_session_passKey", per_page, session_expiry_minutes) FROM stdin;
4aa0f524-eca6-451a-b274-c2c2d10f6951	YER	100	ar	2026-05-26 03:28:22.477	2026-05-26 13:29:14.512	t	25	30
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."User" (id, username, password, is_admin, is_disable, created_at, updated_at) FROM stdin;
f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	admin	d68552c73d571aaebd93132d7b9273249fa23454b1bee2d8cf5f32ad340a09f9	t	f	2026-05-25 09:55:03.393	2026-05-26 03:28:22.418
a5a6ce7c-d465-4e50-9a86-9b781b094eab	عزالدين دحان	de55c32f249028ef5327326c6587b4deb6e4babf4da95571bc78915f273dbfdf	f	f	2026-05-25 17:04:30.279	2026-05-26 10:12:34.394
ed49f96c-7b3a-48da-86c5-6bcadc33a48a	سليمان_دحان	de55c32f249028ef5327326c6587b4deb6e4babf4da95571bc78915f273dbfdf	f	f	2026-05-25 17:03:55.269	2026-05-26 10:12:41.081
\.


--
-- Data for Name: UserSession; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public."UserSession" (id, "userId", created_at, updated_at, expires_at) FROM stdin;
61cce3f6-3df5-4b8e-be3f-f97f5f1d2a7a	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 10:37:32.073	2026-05-26 10:37:49.923	2026-05-26 11:07:49.923
1d320080-c303-4f1d-8f49-00ea1a495d61	a5a6ce7c-d465-4e50-9a86-9b781b094eab	2026-05-26 10:14:58.069	2026-05-26 10:27:47.591	2026-05-26 10:57:47.59
2fa7b063-bcb0-4e6d-9319-555f57df8fcf	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 13:08:05.03	2026-05-26 13:34:16.215	2026-05-26 14:04:16.215
76c89c61-6024-4b79-816b-16724e2a0f39	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 01:07:07.955	2026-05-26 02:25:40.129	2026-05-26 02:55:40.128
553ee5a2-8cf0-4ba0-b443-79b8af97237b	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 15:28:42.525	2026-05-26 16:02:52.168	2026-05-26 16:32:52.168
bae4724d-dc75-4ef1-a284-ab566c66d646	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-25 13:19:05.823	2026-05-25 13:23:20.819	2026-05-25 13:53:20.819
3e650c05-a48a-46b7-973e-1a0c609e9146	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-25 10:02:22.354	2026-05-25 10:04:28.853	2026-05-25 10:34:28.853
eade3d65-02a9-44f8-b1b0-fa06c25deb54	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-25 13:25:48.825	2026-05-25 14:56:36.684	2026-05-25 15:26:36.682
17268aba-1e9e-47df-981d-6dc2472699ce	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-29 13:57:28.164	2026-05-29 13:57:42.084	2026-05-29 14:27:42.082
b7b55527-55dd-4987-81f1-f30e6dd34e25	ed49f96c-7b3a-48da-86c5-6bcadc33a48a	2026-05-26 17:51:27.409	2026-05-26 17:55:38.372	2026-05-26 18:25:38.372
6e37b54b-f526-49e1-adfb-42c295b87c06	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 22:14:24.169	2026-05-26 22:19:56.312	2026-05-26 22:49:56.311
91d52192-9c24-43e7-92ad-b7f0a06fc9e9	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-25 18:12:51.065	2026-05-25 18:52:47.193	2026-05-25 19:22:47.192
4e1df09c-fbb1-482e-a594-6be3ba006e88	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 22:13:48.659	2026-05-26 22:13:49.098	2026-05-26 22:43:49.098
fc8c6299-74e2-414e-a561-9d5bd23ac77b	ed49f96c-7b3a-48da-86c5-6bcadc33a48a	2026-05-26 18:01:22.168	2026-05-26 18:32:34.966	2026-05-26 19:02:34.966
5e6fef86-97b3-47d8-9489-715272d80aab	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-25 17:04:05.865	2026-05-25 17:38:09.729	2026-05-25 18:08:09.728
9cb68604-ad48-452f-8382-0c04b9ffc1b4	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 09:50:40.807	2026-05-26 09:50:40.807	2026-05-26 10:20:40.797
ad7f2aee-9cbf-4834-8cbe-7d507132c3cf	f0b5c93a-a0a4-47a6-bf7e-a0f609a484d1	2026-05-26 09:51:28.729	2026-05-26 09:51:28.729	2026-05-26 10:21:28.729
087331f1-72fc-4e25-9404-f17f8b0b4f8f	ed49f96c-7b3a-48da-86c5-6bcadc33a48a	2026-05-26 15:45:40.681	2026-05-26 15:46:02.832	2026-05-26 16:16:02.832
08dd61cd-fcfe-42ec-8f3b-825085641f0c	ed49f96c-7b3a-48da-86c5-6bcadc33a48a	2026-05-26 18:33:14.562	2026-05-26 18:39:25.722	2026-05-26 19:09:25.721
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: cafe_admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
780e360c-abf3-4858-a366-8bd1e7af549e	c045f614bf89c817fd073f47dec194cbd5d804ec84d238f7bb409d2f9e1b7916	2026-05-25 07:47:23.174203+00	20260511191716_init	\N	\N	2026-05-25 07:47:23.129878+00	1
f72864af-8b32-4c7e-9c3a-ec04ef1b37b0	18ac23d694b8d83676ca2aa6e9d32b2807fbb482027df110ca43ef717e9eff32	2026-05-25 07:47:23.426237+00	20260511211731_main_tablesnpx	\N	\N	2026-05-25 07:47:23.177243+00	1
420aba50-07cb-4b87-a656-5363c597fde9	930326a398bf928d1ae0632d9b810f74e9faa062f27ce96d31418571fb315a3c	2026-05-25 07:47:23.575159+00	20260511221054_rename_reservation_item_to_order	\N	\N	2026-05-25 07:47:23.43266+00	1
55425097-144b-4eb3-bce0-88a8d9f3ea53	65ff4c22bfa222899ace716c23540533519bf16d8ff2647e77f45afcecb54341	2026-05-25 07:47:23.648891+00	20260512191056_add_completed_column_to_reservations_table	\N	\N	2026-05-25 07:47:23.580903+00	1
\.


--
-- Name: Reservation_number_seq; Type: SEQUENCE SET; Schema: public; Owner: cafe_admin
--

SELECT pg_catalog.setval('public."Reservation_number_seq"', 2, true);


--
-- Name: ItemGroup ItemGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."ItemGroup"
    ADD CONSTRAINT "ItemGroup_pkey" PRIMARY KEY (id);


--
-- Name: Item Item_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Room Room_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_pkey" PRIMARY KEY (id);


--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (id);


--
-- Name: UserSession UserSession_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ItemGroup_name_key; Type: INDEX; Schema: public; Owner: cafe_admin
--

CREATE UNIQUE INDEX "ItemGroup_name_key" ON public."ItemGroup" USING btree (name);


--
-- Name: Item_name_key; Type: INDEX; Schema: public; Owner: cafe_admin
--

CREATE UNIQUE INDEX "Item_name_key" ON public."Item" USING btree (name);


--
-- Name: Reservation_number_key; Type: INDEX; Schema: public; Owner: cafe_admin
--

CREATE UNIQUE INDEX "Reservation_number_key" ON public."Reservation" USING btree (number);


--
-- Name: Reservation_order_passkey_key; Type: INDEX; Schema: public; Owner: cafe_admin
--

CREATE UNIQUE INDEX "Reservation_order_passkey_key" ON public."Reservation" USING btree (order_passkey);


--
-- Name: Room_name_key; Type: INDEX; Schema: public; Owner: cafe_admin
--

CREATE UNIQUE INDEX "Room_name_key" ON public."Room" USING btree (name);


--
-- Name: Room_qr_code_key; Type: INDEX; Schema: public; Owner: cafe_admin
--

CREATE UNIQUE INDEX "Room_qr_code_key" ON public."Room" USING btree (qr_code);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: cafe_admin
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Item Item_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."ItemGroup"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public."Item"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_reservation_id_fkey" FOREIGN KEY (reservation_id) REFERENCES public."Reservation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public."Room"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserSession UserSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cafe_admin
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict rXsriVoQCfDPaM9SHjmqjaD0mPCjxdYLAk7OrRfTLOtD79TEKw17RtDSggp2SFa

