-- Wider approved skill catalog. Skills users already typed with these names become approved too.
INSERT OR IGNORE INTO skills(id,name,approved) VALUES
 ('skill-figma','Figma',1),('skill-uiux','UI/UX dizayn',1),('skill-excel','Excel',1),('skill-sql','SQL',1),
 ('skill-js','JavaScript',1),('skill-java','Java',1),('skill-cpp','C++',1),('skill-web','Web dasturlash',1),
 ('skill-data','Data analiz',1),('skill-ml','Machine learning',1),('skill-ai','Sun’iy intellekt',1),('skill-math','Matematika',1),
 ('skill-econ','Iqtisodiyot',1),('skill-finance','Moliya',1),('skill-marketing','Marketing',1),('skill-smm','SMM',1),
 ('skill-copy','Kopirayting',1),('skill-speech','Ommaviy nutq',1),('skill-debate','Debat',1),('skill-mun','MUN',1),
 ('skill-law','Xalqaro huquq',1),('skill-diplomacy','Diplomatiya',1),('skill-ir','Xalqaro munosabatlar',1),('skill-pm','Loyiha boshqaruvi',1),
 ('skill-business','Biznes',1),('skill-photo','Fotografiya',1),('skill-mobile','Mobilografiya',1),('skill-sat','SAT',1),
 ('skill-toefl','TOEFL',1),('skill-cefr','CEFR',1),('skill-russian','Rus tili',1),('skill-korean','Koreys tili',1),
 ('skill-german','Nemis tili',1),('skill-turkish','Turk tili',1),('skill-arabic','Arab tili',1),('skill-french','Fransuz tili',1),
 ('skill-chinese','Xitoy tili',1),('skill-japanese','Yapon tili',1),('skill-spanish','Ispan tili',1),('skill-writing','Akademik yozuv',1);
UPDATE skills SET approved=1 WHERE approved=0 AND lower(name) IN ('figma','ui/ux dizayn','excel','sql','javascript','java','c++','web dasturlash','data analiz','machine learning','matematika','iqtisodiyot','moliya','marketing','smm','kopirayting','ommaviy nutq','debat','mun','xalqaro huquq','diplomatiya','xalqaro munosabatlar','loyiha boshqaruvi','biznes','fotografiya','mobilografiya','sat','toefl','cefr','rus tili','koreys tili','nemis tili','turk tili','arab tili','fransuz tili','xitoy tili','yapon tili','ispan tili','akademik yozuv')
