-- parent_message_id는 ASSISTANT 메시지가 어떤 USER 메시지에 대한 답변인지 연결하는 컬럼이다.
-- USER 메시지 1개에 ASSISTANT 메시지 1개만 연결되도록 UNIQUE 제약을 추가한다.
-- PostgreSQL UNIQUE 제약은 NULL 값을 여러 개 허용하므로, parent_message_id가 NULL인 USER 메시지들은 문제없이 여러 개 저장 가능하다.

DROP INDEX IF EXISTS idx_chat_messages_user_message_id;

ALTER TABLE chat_messages
    ADD CONSTRAINT uk_chat_messages_parent_message UNIQUE (parent_message_id);


-- 산업재해 발생형태 상위 분류 코드 초기 데이터
-- 재해발생분류코드 -> risk_type_code
-- 재해발생분류 -> 괄호 설명 제거 후 risk_type_name_ko

INSERT INTO risk_types (
    risk_type_code,
    risk_type_name_ko,
    risk_type_name_en,
    risk_type_name_ne,
    risk_type_name_km,
    risk_type_name_vi
) VALUES
      ('01', '떨어짐', 'Fall from height', 'उचाइबाट खस्नु', 'ធ្លាក់ពីទីខ្ពស់', 'Rơi từ trên cao'),
      ('02', '넘어짐', 'Slip, trip, or fall on the same level', 'चिप्लिएर वा लड्नु', 'រអិល ឬ ដួល', 'Trượt, vấp hoặc ngã'),
      ('03', '깔림', 'Crushed by object', 'वस्तुले थिचिनु', 'ត្រូវវត្ថុសង្កត់', 'Bị vật đè'),
      ('04', '부딪힘', 'Collision with object', 'वस्तुसँग ठोक्किनु', 'បុកនឹងវត្ថុ', 'Va chạm với vật'),
      ('05', '맞음', 'Struck by flying or falling object', 'उडेर वा खसेको वस्तुले लाग्नु', 'ត្រូវវត្ថុហោះមក ឬ ធ្លាក់មកប៉ះ', 'Bị vật bay hoặc rơi trúng'),
      ('06', '무너짐', 'Collapse', 'भत्किनु', 'បាក់រលំ', 'Sập đổ'),
      ('07', '끼임', 'Caught in or between machinery', 'मेसिनमा च्यापिनु वा अल्झिनु', 'ជាប់ ឬ ត្រូវគាបក្នុងម៉ាស៊ីន', 'Bị kẹt hoặc cuốn vào máy'),
      ('08', '절단·베임·찔림', 'Cut, laceration, or puncture', 'काटिनु, चिरिनु वा घोचिनु', 'កាត់ របួសមុត ឬ ចាក់', 'Đứt, cắt hoặc bị đâm'),
      ('09', '감전', 'Electric shock', 'विद्युत् झटका', 'ឆក់អគ្គិសនី', 'Điện giật'),
      ('10', '폭발·파열', 'Explosion or rupture', 'विस्फोट वा फुट्नु', 'ផ្ទុះ ឬ បែក', 'Nổ hoặc vỡ'),
      ('11', '화재', 'Fire', 'आगलागी', 'អគ្គិភ័យ', 'Hỏa hoạn'),
      ('12', '불균형 및 무리한 동작', 'Loss of balance or excessive motion', 'सन्तुलन गुम्नु वा अत्यधिक बल लगाउनु', 'បាត់បង់លំនឹង ឬ ចលនាខ្លាំងពេក', 'Mất thăng bằng hoặc vận động quá sức'),
      ('13', '이상온도·물체접촉', 'Contact with extreme temperature or object', 'असामान्य तापक्रम वा वस्तुसँग सम्पर्क', 'ប៉ះនឹងសីតុណ្ហភាពខុសប្រក្រតី ឬ វត្ថុ', 'Tiếp xúc với nhiệt độ bất thường hoặc vật thể'),
      ('14', '화학물질누출·접촉', 'Chemical leak or contact', 'रसायन चुहावट वा सम्पर्क', 'លេចធ្លាយ ឬ ប៉ះពាល់សារធាតុគីមី', 'Rò rỉ hoặc tiếp xúc hóa chất'),
      ('15', '산소결핍', 'Oxygen deficiency', 'अक्सिजनको कमी', 'ខ្វះអុកស៊ីសែន', 'Thiếu oxy'),
      ('16', '빠짐·익사', 'Fall into water or drowning', 'पानीमा खस्नु वा डुब्नु', 'ធ្លាក់ទឹក ឬ លង់ទឹក', 'Rơi xuống nước hoặc đuối nước'),
      ('31', '사업장내 교통사고', 'Traffic accident inside workplace', 'कार्यस्थलभित्रको सवारी दुर्घटना', 'គ្រោះថ្នាក់ចរាចរណ៍ក្នុងកន្លែងធ្វើការ', 'Tai nạn giao thông trong nơi làm việc'),
      ('32', '사업장외 교통사고', 'Traffic accident outside workplace', 'कार्यस्थलबाहिरको सवारी दुर्घटना', 'គ្រោះថ្នាក់ចរាចរណ៍ក្រៅកន្លែងធ្វើការ', 'Tai nạn giao thông ngoài nơi làm việc'),
      ('33', '해상항공 교통사고', 'Marine or aviation traffic accident', 'समुद्री वा हवाई यातायात दुर्घटना', 'គ្រោះថ្នាក់ចរាចរណ៍ផ្លូវទឹក ឬ អាកាស', 'Tai nạn giao thông đường biển hoặc hàng không'),
      ('41', '체육행사 등의 사고', 'Accident during sports or events', 'खेलकुद वा कार्यक्रमको क्रममा दुर्घटना', 'គ្រោះថ្នាក់ក្នុងព្រឹត្តិការណ៍កីឡា ឬ កម្មវិធី', 'Tai nạn trong hoạt động thể thao hoặc sự kiện'),
      ('42', '폭력행위', 'Violence', 'हिंसात्मक कार्य', 'អំពើហិង្សា', 'Hành vi bạo lực'),
      ('43', '동물상해', 'Injury caused by animal', 'जनावरबाट चोटपटक', 'របួសដោយសត្វ', 'Bị thương do động vật'),
      ('49', '기타', 'Other', 'अन्य', 'ផ្សេងៗ', 'Khác'),
      ('51', '물리적인자', 'Physical factor', 'भौतिक कारक', 'កត្តារូបវន្ត', 'Yếu tố vật lý'),
      ('52', '유기화합물', 'Organic compound', 'जैविक यौगिक', 'សមាសធាតុសរីរាង្គ', 'Hợp chất hữu cơ'),
      ('53', '허가대상 유해물질', 'Permit-required hazardous substance', 'अनुमति आवश्यक खतरनाक पदार्थ', 'សារធាតុគ្រោះថ្នាក់ដែលត្រូវការការអនុញ្ញាត', 'Chất nguy hại cần được cấp phép'),
      ('54', '금속류', 'Metals', 'धातुहरू', 'លោហៈ', 'Kim loại'),
      ('59', '화학적인자 기타', 'Other chemical factor', 'अन्य रासायनिक कारक', 'កត្តាគីមីផ្សេងៗ', 'Yếu tố hóa học khác'),
      ('61', '생물학적인자', 'Biological factor', 'जैविक कारक', 'កត្តាជីវសាស្ត្រ', 'Yếu tố sinh học'),
      ('63', '독성간염', 'Toxic hepatitis', 'विषाक्त हेपाटाइटिस', 'ជំងឺរលាកថ្លើមដោយសារជាតិពុល', 'Viêm gan nhiễm độc'),
      ('64', '직업성암', 'Occupational cancer', 'व्यावसायिक क्यान्सर', 'មហារីកដោយសារការងារ', 'Ung thư nghề nghiệp'),
      ('69', '직업병 기타', 'Other occupational disease', 'अन्य व्यावसायिक रोग', 'ជំងឺវិជ្ជាជីវៈផ្សេងៗ', 'Bệnh nghề nghiệp khác'),
      ('71', '분진', 'Dust', 'धुलो', 'ធូលី', 'Bụi'),
      ('82', '뇌혈관질환', 'Cerebrovascular disease', 'मस्तिष्क रक्तनलीसम्बन्धी रोग', 'ជំងឺសរសៃឈាមខួរក្បាល', 'Bệnh mạch máu não'),
      ('83', '심혈관질환', 'Cardiovascular disease', 'हृदय तथा रक्तनलीसम्बन्धी रोग', 'ជំងឺបេះដូងនិងសរសៃឈាម', 'Bệnh tim mạch'),
      ('86', '요통', 'Low back pain', 'ढाड दुखाइ', 'ឈឺចង្កេះ', 'Đau lưng'),
      ('87', '수근관증후군', 'Carpal tunnel syndrome', 'कार्पल टनेल सिन्ड्रोम', 'រោគសញ្ញាផ្លូវសរសៃប្រសាទកដៃ', 'Hội chứng ống cổ tay'),
      ('89', '기타 근골격계질환', 'Other musculoskeletal disease', 'अन्य मांसपेशी तथा हड्डीसम्बन्धी रोग', 'ជំងឺសាច់ដុំ និង ឆ្អឹងផ្សេងៗ', 'Bệnh cơ xương khớp khác'),
      ('91', '간질환', 'Liver disease', 'कलेजो रोग', 'ជំងឺថ្លើម', 'Bệnh gan'),
      ('92', '스트레스성질환', 'Stress-related disease', 'तनावसम्बन्धी रोग', 'ជំងឺទាក់ទងនឹងស្ត្រេស', 'Bệnh liên quan đến căng thẳng'),
      ('99', '작업관련성질병 기타', 'Other work-related disease', 'कामसम्बन्धी अन्य रोग', 'ជំងឺពាក់ព័ន្ធនឹងការងារផ្សេងៗ', 'Bệnh liên quan đến công việc khác'),
      ('Z', '분류불능', 'Unclassifiable', 'वर्गीकरण गर्न नसकिने', 'មិនអាចចាត់ថ្នាក់បាន', 'Không thể phân loại');