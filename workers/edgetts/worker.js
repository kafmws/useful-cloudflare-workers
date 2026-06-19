// Edge TTS API Proxy - Minimal Version with Test UI

const TOKEN_REFRESH_BEFORE_EXPIRY = 5 * 60;
const PRESET_OPENAI_VOICE_MAP = {
  shimmer: "zh-CN-XiaoxiaoNeural",
  alloy: "zh-CN-YunyangNeural",
  fable: "zh-CN-YunjianNeural",
  onyx: "zh-CN-XiaoyiNeural",
  nova: "zh-CN-YunxiNeural",
  echo: "zh-CN-liaoning-XiaobeiNeural",
};

const VOICE_CATALOG_CSV = `locale|language|type|voice|gender|styles|roles
af-ZA|Afrikaans (South Africa)|Standard|af-ZA-AdriNeural|Female||
af-ZA|Afrikaans (South Africa)|Standard|af-ZA-WillemNeural|Male||
am-ET|Amharic (Ethiopia)|Standard|am-ET-AmehaNeural|Male||
am-ET|Amharic (Ethiopia)|Standard|am-ET-MekdesNeural|Female||
ar-AE|Arabic (United Arab Emirates)|Standard|ar-AE-FatimaNeural|Female||
ar-AE|Arabic (United Arab Emirates)|Standard|ar-AE-HamdanNeural|Male||
ar-BH|Arabic (Bahrain)|Standard|ar-BH-AliNeural|Male||
ar-BH|Arabic (Bahrain)|Standard|ar-BH-LailaNeural|Female||
ar-DZ|Arabic (Algeria)|Standard|ar-DZ-AminaNeural|Female||
ar-DZ|Arabic (Algeria)|Standard|ar-DZ-IsmaelNeural|Male||
ar-EG|Arabic (Egypt)|Standard|ar-EG-SalmaNeural|Female||
ar-EG|Arabic (Egypt)|Standard|ar-EG-ShakirNeural|Male||
ar-IQ|Arabic (Iraq)|Standard|ar-IQ-BasselNeural|Male||
ar-IQ|Arabic (Iraq)|Standard|ar-IQ-RanaNeural|Female||
ar-JO|Arabic (Jordan)|Standard|ar-JO-SanaNeural|Female||
ar-JO|Arabic (Jordan)|Standard|ar-JO-TaimNeural|Male||
ar-KW|Arabic (Kuwait)|Standard|ar-KW-FahedNeural|Male||
ar-KW|Arabic (Kuwait)|Standard|ar-KW-NouraNeural|Female||
ar-LB|Arabic (Lebanon)|Standard|ar-LB-LaylaNeural|Female||
ar-LB|Arabic (Lebanon)|Standard|ar-LB-RamiNeural|Male||
ar-LY|Arabic (Libya)|Standard|ar-LY-ImanNeural|Female||
ar-LY|Arabic (Libya)|Standard|ar-LY-OmarNeural|Male||
ar-MA|Arabic (Morocco)|Standard|ar-MA-JamalNeural|Male||
ar-MA|Arabic (Morocco)|Standard|ar-MA-MounaNeural|Female||
ar-OM|Arabic (Oman)|Standard|ar-OM-AbdullahNeural|Male||
ar-OM|Arabic (Oman)|Standard|ar-OM-AyshaNeural|Female||
ar-QA|Arabic (Qatar)|Standard|ar-QA-AmalNeural|Female||
ar-QA|Arabic (Qatar)|Standard|ar-QA-MoazNeural|Male||
ar-SA|Arabic (Saudi Arabia)|Standard|ar-SA-HamedNeural|Male||
ar-SA|Arabic (Saudi Arabia)|Standard|ar-SA-ZariyahNeural|Female||
ar-SY|Arabic (Syria)|Standard|ar-SY-AmanyNeural|Female||
ar-SY|Arabic (Syria)|Standard|ar-SY-LaithNeural|Male||
ar-TN|Arabic (Tunisia)|Standard|ar-TN-HediNeural|Male||
ar-TN|Arabic (Tunisia)|Standard|ar-TN-ReemNeural|Female||
ar-YE|Arabic (Yemen)|Standard|ar-YE-MaryamNeural|Female||
ar-YE|Arabic (Yemen)|Standard|ar-YE-SalehNeural|Male||
as-IN|Assamese (India)|Standard|as-IN-PriyomNeural|Male||
as-IN|Assamese (India)|Standard|as-IN-YashicaNeural|Female||
az-AZ|Azerbaijani (Latin, Azerbaijan)|Standard|az-AZ-BabekNeural|Male||
az-AZ|Azerbaijani (Latin, Azerbaijan)|Standard|az-AZ-BanuNeural|Female||
bg-BG|Bulgarian (Bulgaria)|Standard|bg-BG-BorislavNeural|Male||
bg-BG|Bulgarian (Bulgaria)|Standard|bg-BG-KalinaNeural|Female||
bn-BD|Bangla (Bangladesh)|Standard|bn-BD-NabanitaNeural|Female||
bn-BD|Bangla (Bangladesh)|Standard|bn-BD-PradeepNeural|Male||
bn-IN|Bengali (India)|Standard|bn-IN-BashkarNeural|Male||
bn-IN|Bengali (India)|Standard|bn-IN-TanishaaNeural|Female||
bs-BA|Bosnian (Bosnia and Herzegovina)|Standard|bs-BA-GoranNeural|Male||
bs-BA|Bosnian (Bosnia and Herzegovina)|Standard|bs-BA-VesnaNeural|Female||
ca-ES|Catalan|Standard|ca-ES-AlbaNeural|Female||
ca-ES|Catalan|Standard|ca-ES-EnricNeural|Male||
ca-ES|Catalan|Standard|ca-ES-JoanaNeural|Female||
cs-CZ|Czech (Czechia)|Standard|cs-CZ-AntoninNeural|Male||
cs-CZ|Czech (Czechia)|Standard|cs-CZ-VlastaNeural|Female||
cy-GB|Welsh (United Kingdom)|Standard|cy-GB-AledNeural|Male||
cy-GB|Welsh (United Kingdom)|Standard|cy-GB-NiaNeural|Female||
da-DK|Danish (Denmark)|Standard|da-DK-ChristelNeural|Female||
da-DK|Danish (Denmark)|Standard|da-DK-JeppeNeural|Male||
de-AT|German (Austria)|Standard|de-AT-IngridNeural|Female||
de-AT|German (Austria)|Standard|de-AT-JonasNeural|Male||
de-CH|German (Switzerland)|Standard|de-CH-JanNeural|Male||
de-CH|German (Switzerland)|Standard|de-CH-LeniNeural|Female||
de-DE|German (Germany)|Standard|de-DE-AmalaNeural|Female||
de-DE|German (Germany)|Standard|de-DE-BerndNeural|Male||
de-DE|German (Germany)|Standard|de-DE-ChristophNeural|Male||
de-DE|German (Germany)|Standard|de-DE-ConradNeural|Male|cheerful,sad|
de-DE|German (Germany)|Standard|de-DE-ElkeNeural|Female||
de-DE|German (Germany)|Standard|de-DE-GiselaNeural|Female||
de-DE|German (Germany)|Standard|de-DE-KasperNeural|Male||
de-DE|German (Germany)|Standard|de-DE-KatjaNeural|Female||
de-DE|German (Germany)|Standard|de-DE-KillianNeural|Male||
de-DE|German (Germany)|Standard|de-DE-KlarissaNeural|Female||
de-DE|German (Germany)|Standard|de-DE-KlausNeural|Male||
de-DE|German (Germany)|Standard|de-DE-LouisaNeural|Female||
de-DE|German (Germany)|Standard|de-DE-MajaNeural|Female||
de-DE|German (Germany)|Standard|de-DE-RalfNeural|Male||
de-DE|German (Germany)|Standard|de-DE-TanjaNeural|Female||
el-GR|Greek (Greece)|Standard|el-GR-AthinaNeural|Female||
el-GR|Greek (Greece)|Standard|el-GR-NestorasNeural|Male||
en-AU|English (Australia)|Standard|en-AU-AnnetteNeural|Female||
en-AU|English (Australia)|Standard|en-AU-CarlyNeural|Female||
en-AU|English (Australia)|Standard|en-AU-DarrenNeural|Male||
en-AU|English (Australia)|Standard|en-AU-DuncanNeural|Male||
en-AU|English (Australia)|Standard|en-AU-ElsieNeural|Female||
en-AU|English (Australia)|Standard|en-AU-FreyaNeural|Female||
en-AU|English (Australia)|Standard|en-AU-JoanneNeural|Female||
en-AU|English (Australia)|Standard|en-AU-KenNeural|Male||
en-AU|English (Australia)|Standard|en-AU-KimNeural|Female||
en-AU|English (Australia)|Standard|en-AU-NatashaNeural|Female||
en-AU|English (Australia)|Standard|en-AU-NeilNeural|Male||
en-AU|English (Australia)|Standard|en-AU-TimNeural|Male||
en-AU|English (Australia)|Standard|en-AU-TinaNeural|Female||
en-AU|English (Australia)|Standard|en-AU-WilliamNeural|Male||
en-CA|English (Canada)|Standard|en-CA-ClaraNeural|Female||
en-CA|English (Canada)|Standard|en-CA-LiamNeural|Male||
en-GB|English (United Kingdom)|Standard|en-GB-AbbiNeural|Female||
en-GB|English (United Kingdom)|Standard|en-GB-AlfieNeural|Male||
en-GB|English (United Kingdom)|Standard|en-GB-BellaNeural|Female||
en-GB|English (United Kingdom)|Standard|en-GB-ElliotNeural|Male||
en-GB|English (United Kingdom)|Standard|en-GB-EthanNeural|Male||
en-GB|English (United Kingdom)|Standard|en-GB-HollieNeural|Female||
en-GB|English (United Kingdom)|Standard|en-GB-LibbyNeural|Female||
en-GB|English (United Kingdom)|Standard|en-GB-MaisieNeural|Female||
en-GB|English (United Kingdom)|Standard|en-GB-NoahNeural|Male||
en-GB|English (United Kingdom)|Standard|en-GB-OliverNeural|Male||
en-GB|English (United Kingdom)|Standard|en-GB-OliviaNeural|Female||
en-GB|English (United Kingdom)|Standard|en-GB-Ryan:DragonHDLatestNeural|Male||
en-GB|English (United Kingdom)|Standard|en-GB-RyanNeural|Male|chat,cheerful,sad,whispering|
en-GB|English (United Kingdom)|Standard|en-GB-Sonia:DragonHDLatestNeural|Female||
en-GB|English (United Kingdom)|Standard|en-GB-SoniaNeural|Female|cheerful,sad|
en-GB|English (United Kingdom)|Standard|en-GB-ThomasNeural|Male||
en-HK|English (Hong Kong SAR)|Standard|en-HK-SamNeural|Male||
en-HK|English (Hong Kong SAR)|Standard|en-HK-YanNeural|Female||
en-IE|English (Ireland)|Standard|en-IE-ConnorNeural|Male||
en-IE|English (Ireland)|Standard|en-IE-EmilyNeural|Female||
en-IN|English (India)|Standard|en-IN-AaravNeural|Male||
en-IN|English (India)|Standard|en-IN-AartiIndicNeural|Female||
en-IN|English (India)|Standard|en-IN-AartiNeural|Female||
en-IN|English (India)|Standard|en-IN-AashiNeural|Female||
en-IN|English (India)|Standard|en-IN-AnanyaNeural|Female||
en-IN|English (India)|Standard|en-IN-ArjunIndicNeural|Male||
en-IN|English (India)|Standard|en-IN-ArjunNeural|Male||
en-IN|English (India)|Standard|en-IN-KavyaNeural|Female||
en-IN|English (India)|Standard|en-IN-KunalNeural|Male||
en-IN|English (India)|Standard|en-IN-NeerjaIndicNeural|Female||
en-IN|English (India)|Standard|en-IN-NeerjaNeural|Female|cheerful,empathetic,newscast|
en-IN|English (India)|Standard|en-IN-PrabhatIndicNeural|Male||
en-IN|English (India)|Standard|en-IN-PrabhatNeural|Male||
en-IN|English (India)|Standard|en-IN-RehaanNeural|Male||
en-KE|English (Kenya)|Standard|en-KE-AsiliaNeural|Female||
en-KE|English (Kenya)|Standard|en-KE-ChilembaNeural|Male||
en-NG|English (Nigeria)|Standard|en-NG-AbeoNeural|Male||
en-NG|English (Nigeria)|Standard|en-NG-EzinneNeural|Female||
en-NZ|English (New Zealand)|Standard|en-NZ-MitchellNeural|Male||
en-NZ|English (New Zealand)|Standard|en-NZ-MollyNeural|Female||
en-PH|English (Philippines)|Standard|en-PH-JamesNeural|Male||
en-PH|English (Philippines)|Standard|en-PH-RosaNeural|Female||
en-SG|English (Singapore)|Standard|en-SG-LunaNeural|Female||
en-SG|English (Singapore)|Standard|en-SG-WayneNeural|Male||
en-TZ|English (Tanzania)|Standard|en-TZ-ElimuNeural|Male||
en-TZ|English (Tanzania)|Standard|en-TZ-ImaniNeural|Female||
en-US|English (United States)|Standard|en-Multitalker:DragonHDLatestNeural|||
en-US|English (United States)|Standard|en-US-AIGenerate1Neural|Male||
en-US|English (United States)|Standard|en-US-AIGenerate2Neural|Female||
en-US|English (United States)|Standard|en-US-AmberNeural|Female||
en-US|English (United States)|Standard|en-US-AnaNeural|Female||
en-US|English (United States)|Standard|en-US-AndrewNeural|Male||
en-US|English (United States)|Standard|en-US-AriaNeural|Female|angry,chat,cheerful,customerservice,empathetic,excited,friendly,hopeful,narration-professional,newscast-casual,newscast-formal,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-AshleyNeural|Female||
en-US|English (United States)|Standard|en-US-AvaNeural|Female|angry,fearful,sad|
en-US|English (United States)|Standard|en-US-BlueNeural|||
en-US|English (United States)|Standard|en-US-BrandonNeural|Male||
en-US|English (United States)|Standard|en-US-BrianNeural|Male||
en-US|English (United States)|Standard|en-US-ChristopherNeural|Male||
en-US|English (United States)|Standard|en-US-CoraNeural|Female||
en-US|English (United States)|Standard|en-US-DavisNeural|Male|angry,chat,cheerful,excited,friendly,hopeful,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-ElizabethNeural|Female||
en-US|English (United States)|Standard|en-US-EmmaNeural|Female||
en-US|English (United States)|Standard|en-US-EricNeural|Male||
en-US|English (United States)|Standard|en-US-Grant:MAI-Voice-1||anger,confusion,determination,disgust,embarrassment,excitement,fear,generalconversation,happiness,hope,jealousy,joy,neutral,professional,regret,relief,sadness,shouting,softvoice,surprise,whispering|
en-US|English (United States)|Standard|en-US-GuyNeural|Male|angry,cheerful,excited,friendly,hopeful,newscast,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-Iris:MAI-Voice-1||anger,confusion,determination,disgust,embarrassment,excitement,fear,generalconversation,happiness,hope,jealousy,joy,narration,neutral,regret,relief,sadness,shouting,softvoice,surprise,whispering|
en-US|English (United States)|Standard|en-US-JacobNeural|Male||
en-US|English (United States)|Standard|en-US-JaneNeural|Female|angry,cheerful,excited,friendly,hopeful,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-JasonNeural|Male|angry,cheerful,excited,friendly,hopeful,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-Jasper:MAI-Voice-1||anger,confusion,disgust,embarrassment,excitement,fear,generalconversation,happiness,hope,jealous,joy,learning,media,persuasive,regret,sadness,sales,surprise|
en-US|English (United States)|Standard|en-US-JennyNeural|Female|angry,assistant,chat,cheerful,customerservice,excited,friendly,hopeful,newscast,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-Joy:MAI-Voice-1|||
en-US|English (United States)|Standard|en-US-June:MAI-Voice-1||anger,callcenter,confusion,customerservice,disgust,embarrassment,fear,generalconversation,happiness,jealous,joy,learning,professional,regret,sadness,surprise|
en-US|English (United States)|Standard|en-US-KaiNeural|Male|conversation|
en-US|English (United States)|Standard|en-US-LunaNeural|Female|conversation|
en-US|English (United States)|Standard|en-US-MichelleNeural|Female||
en-US|English (United States)|Standard|en-US-MonicaNeural|Female||
en-US|English (United States)|Standard|en-US-NancyNeural|Female|angry,cheerful,excited,friendly,hopeful,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-Reed:MAI-Voice-1|||
en-US|English (United States)|Standard|en-US-RogerNeural|Male||
en-US|English (United States)|Standard|en-US-SaraNeural|Female|angry,cheerful,excited,friendly,hopeful,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|en-US-SteffanNeural|Male||
en-US|English (United States)|Standard|en-US-TonyNeural|Male|angry,cheerful,excited,friendly,hopeful,sad,shouting,terrified,unfriendly,whispering|
en-US|English (United States)|Standard|fr-Multitalker:DragonHDLatestNeural|||
en-US|English (United States)|Standard|zh-Multitalker:DragonHDLatestNeural|||
en-ZA|English (South Africa)|Standard|en-ZA-LeahNeural|Female||
en-ZA|English (South Africa)|Standard|en-ZA-LukeNeural|Male||
es-AR|Spanish (Argentina)|Standard|es-AR-ElenaNeural|Female||
es-AR|Spanish (Argentina)|Standard|es-AR-TomasNeural|Male||
es-BO|Spanish (Bolivia)|Standard|es-BO-MarceloNeural|Male||
es-BO|Spanish (Bolivia)|Standard|es-BO-SofiaNeural|Female||
es-CL|Spanish (Chile)|Standard|es-CL-CatalinaNeural|Female||
es-CL|Spanish (Chile)|Standard|es-CL-LorenzoNeural|Male||
es-CO|Spanish (Colombia)|Standard|es-CO-GonzaloNeural|Male||
es-CO|Spanish (Colombia)|Standard|es-CO-SalomeNeural|Female||
es-CR|Spanish (Costa Rica)|Standard|es-CR-JuanNeural|Male||
es-CR|Spanish (Costa Rica)|Standard|es-CR-MariaNeural|Female||
es-CU|Spanish (Cuba)|Standard|es-CU-BelkysNeural|Female||
es-CU|Spanish (Cuba)|Standard|es-CU-ManuelNeural|Male||
es-DO|Spanish (Dominican Republic)|Standard|es-DO-EmilioNeural|Male||
es-DO|Spanish (Dominican Republic)|Standard|es-DO-RamonaNeural|Female||
es-EC|Spanish (Ecuador)|Standard|es-EC-AndreaNeural|Female||
es-EC|Spanish (Ecuador)|Standard|es-EC-LuisNeural|Male||
es-ES|Spanish (Spain)|Standard|es-ES-AbrilNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-AlvaroNeural|Male|cheerful,sad|
es-ES|Spanish (Spain)|Standard|es-ES-ArnauNeural|Male||
es-ES|Spanish (Spain)|Standard|es-ES-DarioNeural|Male||
es-ES|Spanish (Spain)|Standard|es-ES-EliasNeural|Male||
es-ES|Spanish (Spain)|Standard|es-ES-ElviraNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-EstrellaNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-IreneNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-LaiaNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-LiaNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-NilNeural|Male||
es-ES|Spanish (Spain)|Standard|es-ES-SaulNeural|Male||
es-ES|Spanish (Spain)|Standard|es-ES-TeoNeural|Male||
es-ES|Spanish (Spain)|Standard|es-ES-TrianaNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-VeraNeural|Female||
es-ES|Spanish (Spain)|Standard|es-ES-XimenaNeural|Female||
es-GQ|Spanish (Equatorial Guinea)|Standard|es-GQ-JavierNeural|Male||
es-GQ|Spanish (Equatorial Guinea)|Standard|es-GQ-TeresaNeural|Female||
es-GT|Spanish (Guatemala)|Standard|es-GT-AndresNeural|Male||
es-GT|Spanish (Guatemala)|Standard|es-GT-MartaNeural|Female||
es-HN|Spanish (Honduras)|Standard|es-HN-CarlosNeural|Male||
es-HN|Spanish (Honduras)|Standard|es-HN-KarlaNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-BeatrizNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-CandelaNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-CarlotaNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-CecilioNeural|Male||
es-MX|Spanish (Mexico)|Standard|es-MX-DaliaNeural|Female|cheerful,sad,whispering|
es-MX|Spanish (Mexico)|Standard|es-MX-GerardoNeural|Male||
es-MX|Spanish (Mexico)|Standard|es-MX-JorgeNeural|Male|chat,cheerful,excited,sad,whispering|
es-MX|Spanish (Mexico)|Standard|es-MX-LarissaNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-LibertoNeural|Male||
es-MX|Spanish (Mexico)|Standard|es-MX-LucianoNeural|Male||
es-MX|Spanish (Mexico)|Standard|es-MX-MarinaNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-NuriaNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-PelayoNeural|Male||
es-MX|Spanish (Mexico)|Standard|es-MX-RenataNeural|Female||
es-MX|Spanish (Mexico)|Standard|es-MX-YagoNeural|Male||
es-NI|Spanish (Nicaragua)|Standard|es-NI-FedericoNeural|Male||
es-NI|Spanish (Nicaragua)|Standard|es-NI-YolandaNeural|Female||
es-PA|Spanish (Panama)|Standard|es-PA-MargaritaNeural|Female||
es-PA|Spanish (Panama)|Standard|es-PA-RobertoNeural|Male||
es-PE|Spanish (Peru)|Standard|es-PE-AlexNeural|Male||
es-PE|Spanish (Peru)|Standard|es-PE-CamilaNeural|Female||
es-PR|Spanish (Puerto Rico)|Standard|es-PR-KarinaNeural|Female||
es-PR|Spanish (Puerto Rico)|Standard|es-PR-VictorNeural|Male||
es-PY|Spanish (Paraguay)|Standard|es-PY-MarioNeural|Male||
es-PY|Spanish (Paraguay)|Standard|es-PY-TaniaNeural|Female||
es-SV|Spanish (El Salvador)|Standard|es-SV-LorenaNeural|Female||
es-SV|Spanish (El Salvador)|Standard|es-SV-RodrigoNeural|Male||
es-US|Spanish (United States)|Standard|es-US-AlonsoNeural|Male||
es-US|Spanish (United States)|Standard|es-US-PalomaNeural|Female||
es-UY|Spanish (Uruguay)|Standard|es-UY-MateoNeural|Male||
es-UY|Spanish (Uruguay)|Standard|es-UY-ValentinaNeural|Female||
es-VE|Spanish (Venezuela)|Standard|es-VE-PaolaNeural|Female||
es-VE|Spanish (Venezuela)|Standard|es-VE-SebastianNeural|Male||
et-EE|Estonian (Estonia)|Standard|et-EE-AnuNeural|Female||
et-EE|Estonian (Estonia)|Standard|et-EE-KertNeural|Male||
eu-ES|Basque|Standard|eu-ES-AinhoaNeural|Female||
eu-ES|Basque|Standard|eu-ES-AnderNeural|Male||
fa-IR|Persian (Iran)|Standard|fa-IR-DilaraNeural|Female||
fa-IR|Persian (Iran)|Standard|fa-IR-FaridNeural|Male||
fi-FI|Finnish (Finland)|Standard|fi-FI-HarriNeural|Male||
fi-FI|Finnish (Finland)|Standard|fi-FI-NooraNeural|Female||
fi-FI|Finnish (Finland)|Standard|fi-FI-SelmaNeural|Female||
fil-PH|Filipino (Philippines)|Standard|fil-PH-AngeloNeural|Male||
fil-PH|Filipino (Philippines)|Standard|fil-PH-BlessicaNeural|Female||
fr-BE|French (Belgium)|Standard|fr-BE-CharlineNeural|Female||
fr-BE|French (Belgium)|Standard|fr-BE-GerardNeural|Male||
fr-CA|French (Canada)|Standard|fr-CA-AntoineNeural|Male||
fr-CA|French (Canada)|Standard|fr-CA-JeanNeural|Male||
fr-CA|French (Canada)|Standard|fr-CA-SylvieNeural|Female||
fr-CA|French (Canada)|Standard|fr-CA-ThierryNeural|Male||
fr-CH|French (Switzerland)|Standard|fr-CH-ArianeNeural|Female||
fr-CH|French (Switzerland)|Standard|fr-CH-FabriceNeural|Male||
fr-FR|French (France)|Standard|fr-FR-AlainNeural|Male||
fr-FR|French (France)|Standard|fr-FR-BrigitteNeural|Female||
fr-FR|French (France)|Standard|fr-FR-CelesteNeural|Female||
fr-FR|French (France)|Standard|fr-FR-ClaudeNeural|Male||
fr-FR|French (France)|Standard|fr-FR-CoralieNeural|Female||
fr-FR|French (France)|Standard|fr-FR-DeniseNeural|Female|cheerful,excited,sad,whispering|
fr-FR|French (France)|Standard|fr-FR-EloiseNeural|Female||
fr-FR|French (France)|Standard|fr-FR-HenriNeural|Male|cheerful,excited,sad,whispering|
fr-FR|French (France)|Standard|fr-FR-JacquelineNeural|Female||
fr-FR|French (France)|Standard|fr-FR-JeromeNeural|Male||
fr-FR|French (France)|Standard|fr-FR-JosephineNeural|Female||
fr-FR|French (France)|Standard|fr-FR-MauriceNeural|Male||
fr-FR|French (France)|Standard|fr-FR-YvesNeural|Male||
fr-FR|French (France)|Standard|fr-FR-YvetteNeural|Female||
ga-IE|Irish (Ireland)|Standard|ga-IE-ColmNeural|Male||
ga-IE|Irish (Ireland)|Standard|ga-IE-OrlaNeural|Female||
gl-ES|Galician|Standard|gl-ES-RoiNeural|Male||
gl-ES|Galician|Standard|gl-ES-SabelaNeural|Female||
gu-IN|Gujarati (India)|Standard|gu-IN-DhwaniNeural|Female||
gu-IN|Gujarati (India)|Standard|gu-IN-NiranjanNeural|Male||
he-IL|Hebrew (Israel)|Standard|he-IL-AvriNeural|Male||
he-IL|Hebrew (Israel)|Standard|he-IL-HilaNeural|Female||
hi-IN|Hindi (India)|Standard|hi-IN-AaravNeural|Male||
hi-IN|Hindi (India)|Standard|hi-IN-AartiNeural|Female||
hi-IN|Hindi (India)|Standard|hi-IN-AnanyaNeural|Female||
hi-IN|Hindi (India)|Standard|hi-IN-ArjunNeural|Male||
hi-IN|Hindi (India)|Standard|hi-IN-KavyaNeural|Female||
hi-IN|Hindi (India)|Standard|hi-IN-KunalNeural|Male||
hi-IN|Hindi (India)|Standard|hi-IN-MadhurNeural|Male||
hi-IN|Hindi (India)|Standard|hi-IN-RehaanNeural|Male||
hi-IN|Hindi (India)|Standard|hi-IN-SwaraNeural|Female|cheerful,empathetic,newscast|
hr-HR|Croatian (Croatia)|Standard|hr-HR-GabrijelaNeural|Female||
hr-HR|Croatian (Croatia)|Standard|hr-HR-SreckoNeural|Male||
hu-HU|Hungarian (Hungary)|Standard|hu-HU-NoemiNeural|Female||
hu-HU|Hungarian (Hungary)|Standard|hu-HU-TamasNeural|Male||
hy-AM|Armenian (Armenia)|Standard|hy-AM-AnahitNeural|Female||
hy-AM|Armenian (Armenia)|Standard|hy-AM-HaykNeural|Male||
id-ID|Indonesian (Indonesia)|Standard|id-ID-ArdiNeural|Male||
id-ID|Indonesian (Indonesia)|Standard|id-ID-GadisNeural|Female||
is-IS|Icelandic (Iceland)|Standard|is-IS-GudrunNeural|Female||
is-IS|Icelandic (Iceland)|Standard|is-IS-GunnarNeural|Male||
it-IT|Italian (Italy)|Standard|it-IT-BenignoNeural|Male||
it-IT|Italian (Italy)|Standard|it-IT-CalimeroNeural|Male||
it-IT|Italian (Italy)|Standard|it-IT-CataldoNeural|Male||
it-IT|Italian (Italy)|Standard|it-IT-DiegoNeural|Male|cheerful,excited,sad|
it-IT|Italian (Italy)|Standard|it-IT-ElsaNeural|Female||
it-IT|Italian (Italy)|Standard|it-IT-FabiolaNeural|Female||
it-IT|Italian (Italy)|Standard|it-IT-FiammaNeural|Female||
it-IT|Italian (Italy)|Standard|it-IT-GianniNeural|Male||
it-IT|Italian (Italy)|Standard|it-IT-GiuseppeNeural|Male||
it-IT|Italian (Italy)|Standard|it-IT-ImeldaNeural|Female||
it-IT|Italian (Italy)|Standard|it-IT-IrmaNeural|Female||
it-IT|Italian (Italy)|Standard|it-IT-IsabellaNeural|Female|chat,cheerful,excited,sad,whispering|
it-IT|Italian (Italy)|Standard|it-IT-LisandroNeural|Male||
it-IT|Italian (Italy)|Standard|it-IT-PalmiraNeural|Female||
it-IT|Italian (Italy)|Standard|it-IT-PierinaNeural|Female||
it-IT|Italian (Italy)|Standard|it-IT-RinaldoNeural|Male||
iu-CANS-CA|Inuktitut (Syllabics, Canada)|Standard|iu-Cans-CA-SiqiniqNeural|Female||
iu-CANS-CA|Inuktitut (Syllabics, Canada)|Standard|iu-Cans-CA-TaqqiqNeural|Male||
iu-LATN-CA|Inuktitut (Latin, Canada)|Standard|iu-Latn-CA-SiqiniqNeural|Female||
iu-LATN-CA|Inuktitut (Latin, Canada)|Standard|iu-Latn-CA-TaqqiqNeural|Male||
ja-JP|Japanese (Japan)|Standard|ja-JP-AoiNeural|Female||
ja-JP|Japanese (Japan)|Standard|ja-JP-DaichiNeural|Male||
ja-JP|Japanese (Japan)|Standard|ja-JP-KeitaNeural|Male||
ja-JP|Japanese (Japan)|Standard|ja-JP-MayuNeural|Female||
ja-JP|Japanese (Japan)|Standard|ja-JP-NanamiNeural|Female|chat,cheerful,customerservice|
ja-JP|Japanese (Japan)|Standard|ja-JP-NaokiNeural|Male||
ja-JP|Japanese (Japan)|Standard|ja-JP-ShioriNeural|Female||
jv-ID|Javanese (Latin, Indonesia)|Standard|jv-ID-DimasNeural|Male||
jv-ID|Javanese (Latin, Indonesia)|Standard|jv-ID-SitiNeural|Female||
ka-GE|Georgian (Georgia)|Standard|ka-GE-EkaNeural|Female||
ka-GE|Georgian (Georgia)|Standard|ka-GE-GiorgiNeural|Male||
kk-KZ|Kazakh (Kazakhstan)|Standard|kk-KZ-AigulNeural|Female||
kk-KZ|Kazakh (Kazakhstan)|Standard|kk-KZ-DauletNeural|Male||
km-KH|Khmer (Cambodia)|Standard|km-KH-PisethNeural|Male||
km-KH|Khmer (Cambodia)|Standard|km-KH-SreymomNeural|Female||
kn-IN|Kannada (India)|Standard|kn-IN-GaganNeural|Male||
kn-IN|Kannada (India)|Standard|kn-IN-SapnaNeural|Female||
ko-KR|Korean (Korea)|Standard|ko-KR-BongJinNeural|Male||
ko-KR|Korean (Korea)|Standard|ko-KR-GookMinNeural|Male||
ko-KR|Korean (Korea)|Standard|ko-KR-HyunsuNeural|Male||
ko-KR|Korean (Korea)|Standard|ko-KR-InJoonNeural|Male|sad|
ko-KR|Korean (Korea)|Standard|ko-KR-JiMinNeural|Female||
ko-KR|Korean (Korea)|Standard|ko-KR-SeoHyeonNeural|Female||
ko-KR|Korean (Korea)|Standard|ko-KR-SoonBokNeural|Female||
ko-KR|Korean (Korea)|Standard|ko-KR-SunHiNeural|Female||
ko-KR|Korean (Korea)|Standard|ko-KR-YuJinNeural|Female||
lo-LA|Lao (Laos)|Standard|lo-LA-ChanthavongNeural|Male||
lo-LA|Lao (Laos)|Standard|lo-LA-KeomanyNeural|Female||
lt-LT|Lithuanian (Lithuania)|Standard|lt-LT-LeonasNeural|Male||
lt-LT|Lithuanian (Lithuania)|Standard|lt-LT-OnaNeural|Female||
lv-LV|Latvian (Latvia)|Standard|lv-LV-EveritaNeural|Female||
lv-LV|Latvian (Latvia)|Standard|lv-LV-NilsNeural|Male||
mk-MK|Macedonian (North Macedonia)|Standard|mk-MK-AleksandarNeural|Male||
mk-MK|Macedonian (North Macedonia)|Standard|mk-MK-MarijaNeural|Female||
ml-IN|Malayalam (India)|Standard|ml-IN-MidhunNeural|Male||
ml-IN|Malayalam (India)|Standard|ml-IN-SobhanaNeural|Female||
mn-MN|Mongolian (Mongolia)|Standard|mn-MN-BataaNeural|Male||
mn-MN|Mongolian (Mongolia)|Standard|mn-MN-YesuiNeural|Female||
mr-IN|Marathi (India)|Standard|mr-IN-AarohiNeural|Female||
mr-IN|Marathi (India)|Standard|mr-IN-ManoharNeural|Male||
ms-MY|Malay (Malaysia)|Standard|ms-MY-OsmanNeural|Male||
ms-MY|Malay (Malaysia)|Standard|ms-MY-Yasmin:DragonHDLatestNeural|Female||
ms-MY|Malay (Malaysia)|Standard|ms-MY-YasminNeural|Female||
mt-MT|Maltese (Malta)|Standard|mt-MT-GraceNeural|Female||
mt-MT|Maltese (Malta)|Standard|mt-MT-JosephNeural|Male||
my-MM|Burmese (Myanmar)|Standard|my-MM-NilarNeural|Female||
my-MM|Burmese (Myanmar)|Standard|my-MM-ThihaNeural|Male||
nb-NO|Norwegian Bokm├Ñl (Norway)|Standard|nb-NO-FinnNeural|Male||
nb-NO|Norwegian Bokm├Ñl (Norway)|Standard|nb-NO-IselinNeural|Female||
nb-NO|Norwegian Bokm├Ñl (Norway)|Standard|nb-NO-PernilleNeural|Female||
ne-NP|Nepali (Nepal)|Standard|ne-NP-HemkalaNeural|Female||
ne-NP|Nepali (Nepal)|Standard|ne-NP-SagarNeural|Male||
nl-BE|Dutch (Belgium)|Standard|nl-BE-ArnaudNeural|Male||
nl-BE|Dutch (Belgium)|Standard|nl-BE-DenaNeural|Female||
nl-NL|Dutch (Netherlands)|Standard|nl-NL-ColetteNeural|Female||
nl-NL|Dutch (Netherlands)|Standard|nl-NL-FennaNeural|Female||
nl-NL|Dutch (Netherlands)|Standard|nl-NL-MaartenNeural|Male||
or-IN|Odia (India)|Standard|or-IN-SubhasiniNeural|Female||
or-IN|Odia (India)|Standard|or-IN-SukantNeural|Male||
pa-IN|Punjabi (India)|Standard|pa-IN-OjasNeural|Male||
pa-IN|Punjabi (India)|Standard|pa-IN-VaaniNeural|Female||
pl-PL|Polish (Poland)|Standard|pl-PL-AgnieszkaNeural|Female||
pl-PL|Polish (Poland)|Standard|pl-PL-MarekNeural|Male||
pl-PL|Polish (Poland)|Standard|pl-PL-ZofiaNeural|Female||
ps-AF|Pashto (Afghanistan)|Standard|ps-AF-GulNawazNeural|Male||
ps-AF|Pashto (Afghanistan)|Standard|ps-AF-LatifaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-AntonioNeural|Male||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-BrendaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-DonatoNeural|Male||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-ElzaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-FabioNeural|Male||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-FranciscaNeural|Female|calm|
pt-BR|Portuguese (Brazil)|Standard|pt-BR-GiovannaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-HumbertoNeural|Male||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-JulioNeural|Male||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-LeilaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-LeticiaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-ManuelaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-NicolauNeural|Male||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-ThalitaNeural|Female||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-ValerioNeural|Male||
pt-BR|Portuguese (Brazil)|Standard|pt-BR-YaraNeural|Female||
pt-PT|Portuguese (Portugal)|Standard|pt-PT-DuarteNeural|Male||
pt-PT|Portuguese (Portugal)|Standard|pt-PT-FernandaNeural|Female||
pt-PT|Portuguese (Portugal)|Standard|pt-PT-RaquelNeural|Female|sad,whispering|
ro-RO|Romanian (Romania)|Standard|ro-RO-AlinaNeural|Female||
ro-RO|Romanian (Romania)|Standard|ro-RO-EmilNeural|Male||
ru-RU|Russian (Russia)|Standard|ru-RU-DariyaNeural|Female||
ru-RU|Russian (Russia)|Standard|ru-RU-DmitryNeural|Male||
ru-RU|Russian (Russia)|Standard|ru-RU-SvetlanaNeural|Female||
si-LK|Sinhala (Sri Lanka)|Standard|si-LK-SameeraNeural|Male||
si-LK|Sinhala (Sri Lanka)|Standard|si-LK-ThiliniNeural|Female||
sk-SK|Slovak (Slovakia)|Standard|sk-SK-LukasNeural|Male||
sk-SK|Slovak (Slovakia)|Standard|sk-SK-ViktoriaNeural|Female||
sl-SI|Slovenian (Slovenia)|Standard|sl-SI-PetraNeural|Female||
sl-SI|Slovenian (Slovenia)|Standard|sl-SI-RokNeural|Male||
so-SO|Somali (Somalia)|Standard|so-SO-MuuseNeural|Male||
so-SO|Somali (Somalia)|Standard|so-SO-UbaxNeural|Female||
sq-AL|Albanian (Albania)|Standard|sq-AL-AnilaNeural|Female||
sq-AL|Albanian (Albania)|Standard|sq-AL-IlirNeural|Male||
sr-LATN-RS|Serbian (Latin, Serbia)|Standard|sr-Latn-RS-NicholasNeural|Male||
sr-LATN-RS|Serbian (Latin, Serbia)|Standard|sr-Latn-RS-SophieNeural|Female||
sr-RS|Serbian (Cyrillic, Serbia)|Standard|sr-RS-NicholasNeural|Male||
sr-RS|Serbian (Cyrillic, Serbia)|Standard|sr-RS-SophieNeural|Female||
su-ID|Sundanese (Indonesia)|Standard|su-ID-JajangNeural|Male||
su-ID|Sundanese (Indonesia)|Standard|su-ID-TutiNeural|Female||
sv-SE|Swedish (Sweden)|Standard|sv-SE-HilleviNeural|Female||
sv-SE|Swedish (Sweden)|Standard|sv-SE-MattiasNeural|Male||
sv-SE|Swedish (Sweden)|Standard|sv-SE-SofieNeural|Female||
sw-KE|Kiswahili (Kenya)|Standard|sw-KE-RafikiNeural|Male||
sw-KE|Kiswahili (Kenya)|Standard|sw-KE-ZuriNeural|Female||
sw-TZ|Kiswahili (Tanzania)|Standard|sw-TZ-DaudiNeural|Male||
sw-TZ|Kiswahili (Tanzania)|Standard|sw-TZ-RehemaNeural|Female||
ta-IN|Tamil (India)|Standard|ta-IN-PallaviNeural|Female||
ta-IN|Tamil (India)|Standard|ta-IN-ValluvarNeural|Male||
ta-LK|Tamil (Sri Lanka)|Standard|ta-LK-KumarNeural|Male||
ta-LK|Tamil (Sri Lanka)|Standard|ta-LK-SaranyaNeural|Female||
ta-MY|Tamil (Malaysia)|Standard|ta-MY-KaniNeural|Female||
ta-MY|Tamil (Malaysia)|Standard|ta-MY-SuryaNeural|Male||
ta-SG|Tamil (Singapore)|Standard|ta-SG-AnbuNeural|Male||
ta-SG|Tamil (Singapore)|Standard|ta-SG-VenbaNeural|Female||
te-IN|Telugu (India)|Standard|te-IN-MohanNeural|Male||
te-IN|Telugu (India)|Standard|te-IN-ShrutiNeural|Female||
th-TH|Thai (Thailand)|Standard|th-TH-AcharaNeural|Female||
th-TH|Thai (Thailand)|Standard|th-TH-NiwatNeural|Male||
th-TH|Thai (Thailand)|Standard|th-TH-PremwadeeNeural|Female||
tr-TR|Turkish (T├╝rkiye)|Standard|tr-TR-AhmetNeural|Male||
tr-TR|Turkish (T├╝rkiye)|Standard|tr-TR-EmelNeural|Female||
uk-UA|Ukrainian (Ukraine)|Standard|uk-UA-OstapNeural|Male||
uk-UA|Ukrainian (Ukraine)|Standard|uk-UA-PolinaNeural|Female||
ur-IN|Urdu (India)|Standard|ur-IN-GulNeural|Female||
ur-IN|Urdu (India)|Standard|ur-IN-SalmanNeural|Male||
ur-PK|Urdu (Pakistan)|Standard|ur-PK-AsadNeural|Male||
ur-PK|Urdu (Pakistan)|Standard|ur-PK-UzmaNeural|Female||
uz-UZ|Uzbek (Latin, Uzbekistan)|Standard|uz-UZ-MadinaNeural|Female||
uz-UZ|Uzbek (Latin, Uzbekistan)|Standard|uz-UZ-SardorNeural|Male||
vi-VN|Vietnamese (Vietnam)|Standard|vi-VN-HoaiMyNeural|Female||
vi-VN|Vietnamese (Vietnam)|Standard|vi-VN-NamMinhNeural|Male||
wuu-CN|Chinese (Wu, Simplified)|Standard|wuu-CN-XiaotongNeural|Female||
wuu-CN|Chinese (Wu, Simplified)|Standard|wuu-CN-YunzheNeural|Male||
yue-CN|Chinese (Cantonese, Simplified)|Standard|yue-CN-XiaoMinNeural|Female||
yue-CN|Chinese (Cantonese, Simplified)|Standard|yue-CN-YunSongNeural|Male||
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaochenNeural|Female|livecommercial|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-Xiaohan:DragonHDFlashLatestNeural|Female|affectionate,angry,cheerful,complaining,fearful,gentle,sad,shy,strict|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaohanNeural|Female|affectionate,angry,calm,cheerful,disgruntled,embarrassed,fearful,gentle,sad,serious|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaomengNeural|Female|chat|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaomoNeural|Female|affectionate,angry,calm,cheerful,depressed,disgruntled,embarrassed,envious,fearful,gentle,sad,serious|Boy,Girl,OlderAdultFemale,OlderAdultMale,SeniorFemale,SeniorMale,YoungAdultFemale,YoungAdultMale
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoqiuNeural|Female||
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaorouNeural|Female||
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoruiNeural|Female|angry,calm,fearful,sad|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoshuangNeural|Female|chat|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoxiaoDialectsNeural|Female||
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoxiaoNeural|Female|affectionate,angry,assistant,calm,chat,chat-casual,cheerful,customerservice,disgruntled,excited,fearful,friendly,gentle,lyrical,newscast,poetry-reading,sad,serious,sorry,whispering|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoyanNeural|Female||
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoyiNeural|Female|affectionate,angry,cheerful,disgruntled,embarrassed,fearful,gentle,sad,serious|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaoyouNeural|Female||
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-XiaozhenNeural|Female|angry,cheerful,disgruntled,fearful,sad,serious|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunfengNeural|Male|angry,cheerful,depressed,disgruntled,fearful,sad,serious|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-Yunhan:DragonHDFlashLatestNeural|Male|angry,cheerful,curious,empathetic,encouraging,excited,guilty,lonely,sad,serious,sorry,surprised,tired,whispering|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunhaoNeural|Male|advertisement-upbeat|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunjianNeural|Male|angry,cheerful,depressed,disgruntled,documentary-narration,narration-relaxed,sad,serious,sports-commentary,sports-commentary-excited|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunjieNeural|Male||
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-Yunxi:DragonHDFlashLatestNeural|Male|angry,chat,cheerful,complaining,depressed,fearful,news,sad,shy,strict,voice-assistant|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunxiaNeural|Male|angry,calm,cheerful,fearful,sad|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunxiNeural|Male|angry,assistant,chat,cheerful,depressed,disgruntled,embarrassed,fearful,narration-relaxed,newscast,sad,serious|Boy,Narrator,YoungAdultMale
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunyangNeural|Male|customerservice,narration-professional,newscast-casual|
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunyeNeural|Male|angry,calm,cheerful,disgruntled,embarrassed,fearful,sad,serious|Boy,Girl,OlderAdultFemale,OlderAdultMale,SeniorFemale,SeniorMale,YoungAdultFemale,YoungAdultMale
zh-CN|Chinese (Mandarin, Simplified)|Standard|zh-CN-YunzeNeural|Male|angry,calm,cheerful,depressed,disgruntled,documentary-narration,fearful,sad,serious|OlderAdultMale,SeniorMale
zh-CN-GUANGXI|Chinese (Guangxi Accent Mandarin, Simplified)|Standard|zh-CN-guangxi-YunqiNeural|Male||
zh-CN-henan|Chinese (Zhongyuan Mandarin Henan, Simplified)|Standard|zh-CN-henan-YundengNeural|Male||
zh-CN-liaoning|Chinese (Northeastern Mandarin, Simplified)|Standard|zh-CN-liaoning-XiaobeiNeural|Female||
zh-CN-liaoning|Chinese (Northeastern Mandarin, Simplified)|Standard|zh-CN-liaoning-YunbiaoNeural|Male||
zh-CN-shaanxi|Chinese (Zhongyuan Mandarin Shaanxi, Simplified)|Standard|zh-CN-shaanxi-XiaoniNeural|Female||
zh-CN-shandong|Chinese (Jilu Mandarin, Simplified)|Standard|zh-CN-shandong-YunxiangNeural|Male||
zh-CN-sichuan|Chinese (Southwestern Mandarin, Simplified)|Standard|zh-CN-sichuan-YunxiNeural|Male||
zh-HK|Chinese (Cantonese, Traditional)|Standard|zh-HK-HiuGaaiNeural|Female||
zh-HK|Chinese (Cantonese, Traditional)|Standard|zh-HK-HiuMaanNeural|Female||
zh-HK|Chinese (Cantonese, Traditional)|Standard|zh-HK-WanLungNeural|Male||
zh-TW|Chinese (Taiwanese Mandarin, Traditional)|Standard|zh-TW-HsiaoChenNeural|Female||
zh-TW|Chinese (Taiwanese Mandarin, Traditional)|Standard|zh-TW-HsiaoYuNeural|Female||
zh-TW|Chinese (Taiwanese Mandarin, Traditional)|Standard|zh-TW-YunJheNeural|Male||
zu-ZA|isiZulu (South Africa)|Standard|zu-ZA-ThandoNeural|Female||
zu-ZA|isiZulu (South Africa)|Standard|zu-ZA-ThembaNeural|Male||`;

const VOICE_CATALOG = VOICE_CATALOG_CSV.trim()
  .split("\n")
  .slice(1)
  .map(function (line) {
    var parts = line.split("|");
    return {
      locale: parts[0],
      language: parts[1],
      type: parts[2],
      voice: parts[3],
      gender: parts[4] || "",
      styles: parts[5] ? parts[5].split(",") : [],
      roles: parts[6] ? parts[6].split(",") : [],
    };
  });

const OPENAI_VOICE_MAP = (function () {
  var map = {};
  var presetKeys = Object.keys(PRESET_OPENAI_VOICE_MAP);
  for (var i = 0; i < presetKeys.length; i++) {
    map[presetKeys[i]] = PRESET_OPENAI_VOICE_MAP[presetKeys[i]];
  }
  for (var j = 0; j < VOICE_CATALOG.length; j++) {
    map[VOICE_CATALOG[j].voice] = VOICE_CATALOG[j].voice;
  }
  return map;
})();

let tokenInfo = { endpoint: null, token: null, expiredAt: null };

function generateUserIdFromDomain(requestUrl) {
  try {
    var url = new URL(requestUrl);
    var domain = url.hostname;
    var hash = 0;
    for (var i = 0; i < domain.length; i++) {
      hash = (hash << 5) - hash + domain.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0") + Math.abs(hash * 31).toString(16).padStart(8, "0");
  } catch (e) {
    return "0f04d16a175c411e";
  }
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  var result = 0;
  for (var i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export default {
  async fetch(request, env) {
    if (env.API_KEY) globalThis.API_KEY = env.API_KEY;
    return await handleRequest(request);
  },
};

async function handleRequest(request) {
  var url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    return new Response(getTestPageHTML(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (url.pathname.startsWith("/v1/")) {
    var authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Missing or invalid authorization header.", 401, "invalid_api_key");
    }
    var providedKey = authHeader.slice(7);
    if (globalThis.API_KEY) {
      if (!timingSafeEqual(providedKey, globalThis.API_KEY)) {
        return errorResponse("Invalid API key.", 403, "invalid_api_key");
      }
    } else {
      return errorResponse("API key not configured on server.", 500, "server_config_error");
    }
  }

  try {
    if (url.pathname === "/v1/audio/speech") return await handleSpeechRequest(request);
    if (url.pathname === "/v1/models") return handleModelsRequest();
  } catch (err) {
    return errorResponse(err.message, 500, "internal_server_error");
  }

  return errorResponse("Not Found", 404, "not_found");
}

async function handleSpeechRequest(request) {
  if (request.method !== "POST") return errorResponse("Method Not Allowed", 405, "method_not_allowed");

  var body = await request.json();
  if (!body.input) return errorResponse("'input' is a required parameter.", 400, "invalid_request_error");

  var model = body.model || "tts-1";
  var input = body.input;
  var voice = body.voice;
  var speed = body.speed !== undefined ? body.speed : 1.0;
  var pitch = body.pitch !== undefined ? body.pitch : 1.0;
  var style = body.style || "general";
  var role = body.role || "";
  var styleDegree = body.styleDegree !== undefined ? body.styleDegree : 1.0;
  var stream = body.stream || false;
  var cleaning_options = body.cleaning_options || {};

  var finalVoice;
  if (model === "tts-1" || model === "tts-1-hd") {
    finalVoice = OPENAI_VOICE_MAP[voice] || voice || "zh-CN-XiaoxiaoNeural";
  } else if (model.startsWith("tts-1-")) {
    finalVoice = OPENAI_VOICE_MAP[model.replace("tts-1-", "")] || "zh-CN-XiaoxiaoNeural";
  } else {
    finalVoice = voice || model || "zh-CN-XiaoxiaoNeural";
  }

  var opts = {
    remove_markdown: cleaning_options.remove_markdown !== undefined ? cleaning_options.remove_markdown : true,
    remove_emoji: cleaning_options.remove_emoji !== undefined ? cleaning_options.remove_emoji : true,
    remove_urls: cleaning_options.remove_urls !== undefined ? cleaning_options.remove_urls : true,
    remove_line_breaks: cleaning_options.remove_line_breaks || false,
    remove_citation_numbers: cleaning_options.remove_citation_numbers !== undefined ? cleaning_options.remove_citation_numbers : true,
    custom_keywords: cleaning_options.custom_keywords || "",
  };
  var cleanedInput = cleanText(input, opts);
  var rate = ((speed - 1) * 100).toFixed(0);
  var numPitch = ((pitch - 1) * 100).toFixed(0);
  var outputFormat = "audio-24khz-48kbitrate-mono-mp3";

  if (stream) {
    return await getVoiceStream(cleanedInput, finalVoice, rate, numPitch, style, role, styleDegree, outputFormat, request);
  }
  return await getVoice(cleanedInput, finalVoice, rate, numPitch, style, role, styleDegree, outputFormat, request);
}

function handleModelsRequest() {
  var models = [
    { id: "tts-1", object: "model", created: Date.now(), owned_by: "openai" },
    { id: "tts-1-hd", object: "model", created: Date.now(), owned_by: "openai" },
  ];
  var keys = Object.keys(OPENAI_VOICE_MAP);
  for (var i = 0; i < keys.length; i++) {
    models.push({
      id: "tts-1-" + keys[i],
      object: "model",
      created: Date.now(),
      owned_by: "openai",
    });
  }
  return new Response(JSON.stringify({ object: "list", data: models }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

// 智能分块：按句子边界切分，避免硬切
function splitTextIntoChunks(text, maxChunkSize) {
  var chunks = [];
  var sentenceBreaks = ["。", "！", "？", "；", "…", ".", "!", "?", "\n"];

  while (text.length > 0) {
    if (text.length <= maxChunkSize) {
      chunks.push(text);
      break;
    }

    var chunk = text.slice(0, maxChunkSize);
    var lastBreakIndex = -1;

    // 从后往前找句子边界
    for (var i = chunk.length - 1; i >= Math.floor(maxChunkSize * 0.5); i--) {
      var found = false;
      for (var j = 0; j < sentenceBreaks.length; j++) {
        if (chunk[i] === sentenceBreaks[j]) {
          lastBreakIndex = i;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (lastBreakIndex > 0) {
      chunks.push(text.slice(0, lastBreakIndex + 1));
      text = text.slice(lastBreakIndex + 1);
    } else {
      // 找不到句子边界，硬切
      chunks.push(chunk);
      text = text.slice(maxChunkSize);
    }
  }

  return chunks;
}

async function getVoice(text, voiceName, rate, pitch, style, role, styleDegree, outputFormat, request) {
  var chunks = splitTextIntoChunks(text, 2000);
  var audioChunks = [];

  for (var i = 0; i < chunks.length; i++) {
    var blob = await getAudioChunk(chunks[i], voiceName, rate, pitch, style, role, styleDegree, outputFormat, request);
    audioChunks.push(blob);
  }

  return new Response(new Blob(audioChunks, { type: "audio/mpeg" }), {
    headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" },
  });
}

async function getVoiceStream(text, voiceName, rate, pitch, style, role, styleDegree, outputFormat, request) {
  var chunks = splitTextIntoChunks(text, 2000);
  var transform = new TransformStream();
  var writer = transform.writable.getWriter();

  (async function () {
    try {
      for (var i = 0; i < chunks.length; i++) {
        var blob = await getAudioChunk(chunks[i], voiceName, rate, pitch, style, role, styleDegree, outputFormat, request);
        var buffer = await blob.arrayBuffer();
        await writer.write(new Uint8Array(buffer));
      }
    } catch (e) {
      await writer.abort(e);
    } finally {
      await writer.close();
    }
  })();

  return new Response(transform.readable, {
    headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" },
  });
}

async function getAudioChunk(text, voiceName, rate, pitch, style, role, styleDegree, outputFormat, request) {
  var endpoint = await getEndpoint(request);
  var url = "https://" + endpoint.r + ".tts.speech.microsoft.com/cognitiveservices/v1";
  var escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  var content = '<prosody rate="' + rate + '%" pitch="' + pitch + '%">' + escaped + "</prosody>";
  if (style && style !== "general") {
    var attr = styleDegree !== 1.0 ? ' styledegree="' + styleDegree + '"' : "";
    content = '<mstts:express-as style="' + style + '"' + attr + ">" + content + "</mstts:express-as>";
  }
  if (role) {
    content = '<mstts:express-as role="' + role + '">' + content + "</mstts:express-as>";
  }

  var ssml =
    '<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0" xml:lang="zh-CN"><voice name="' +
    voiceName +
    '">' +
    content +
    "</voice></speak>";

  var res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: endpoint.t,
      "Content-Type": "application/ssml+xml",
      "User-Agent": "okhttp/4.5.0",
      "X-Microsoft-OutputFormat": outputFormat,
    },
    body: ssml,
  });
  if (!res.ok) {
    throw new Error("Edge TTS API error: " + res.status);
  }
  return res.blob();
}

async function getEndpoint(request) {
  var now = Date.now() / 1000;

  // 检查缓存的 token 是否有效
  if (tokenInfo.token && tokenInfo.expiredAt && now < tokenInfo.expiredAt - TOKEN_REFRESH_BEFORE_EXPIRY) {
    return tokenInfo.endpoint;
  }

  var endpointUrl = "https://dev.microsofttranslator.com/apps/endpoint?api-version=1.0";
  var clientId = crypto.randomUUID().replace(/-/g, "");
  var userId = generateUserIdFromDomain(request.url);
  var lastError = null;

  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      var res = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Accept-Language": "zh-Hans",
          "X-ClientVersion": "4.0.530a 5fe1dc6c",
          "X-UserId": userId,
          "X-HomeGeographicRegion": "zh-Hans-CN",
          "X-ClientTraceId": clientId,
          "X-MT-Signature": await sign(endpointUrl),
          "User-Agent": "okhttp/4.5.0",
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": "0",
          "Accept-Encoding": "gzip",
        },
      });
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      var data = await res.json();
      var jwt = JSON.parse(atob(data.t.split(".")[1]));
      tokenInfo = { endpoint: data, token: data.t, expiredAt: jwt.exp };
      return data;
    } catch (e) {
      lastError = e;
      if (attempt < 3) {
        await new Promise(function (r) {
          setTimeout(r, 1000 * attempt);
        });
      }
    }
  }

  // 所有重试都失败后的兜底逻辑
  if (tokenInfo.token) {
    // 强制标记为过期，下次请求会重新刷新
    tokenInfo.expiredAt = 0;
    return tokenInfo.endpoint;
  }

  throw new Error("Failed to get endpoint: " + (lastError ? lastError.message : "unknown"));
}

async function sign(urlStr) {
  var url = urlStr.split("://")[1];
  var encodedUrl = encodeURIComponent(url);
  var uuid = crypto.randomUUID().replace(/-/g, "");
  var date = new Date().toUTCString().replace(/GMT/, "").trim() + " GMT";
  var toSign = ("MSTranslatorAndroidApp" + encodedUrl + date + uuid).toLowerCase();
  var keyStr = "oik6PdDdMnOXemTbwvMn9de/h9lFnfBaCWbGMMZqqoSaQaqUOqjVGm5NqsmjcBI1x+sS9ugjB55HEJWRiFXYFw==";
  var keyBytes = Uint8Array.from(atob(keyStr), function (c) {
    return c.charCodeAt(0);
  });
  var cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  var sigBytes = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(toSign)));
  var sig = btoa(String.fromCharCode.apply(null, sigBytes));
  return "MSTranslatorAndroidApp::" + sig + "::" + date + "::" + uuid;
}

function cleanText(text, opts) {
  var t = text;
  if (opts.remove_urls) {
    t = t.replace(/(https?:\/\/[^\s]+)/g, "");
  }
  if (opts.remove_markdown) {
    t = t
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
      .replace(/#{1,6}\s/g, "");
  }
  if (opts.custom_keywords) {
    var kw = opts.custom_keywords
      .split(",")
      .map(function (k) {
        return k.trim();
      })
      .filter(function (k) {
        return k;
      });
    if (kw.length) {
      var pattern = kw
        .map(function (k) {
          return k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        })
        .join("|");
      t = t.replace(new RegExp(pattern, "g"), "");
    }
  }
  if (opts.remove_emoji) {
    t = t.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ""
    );
  }
  if (opts.remove_citation_numbers) {
    t = t.replace(/\[\d+\]/g, "").replace(/【\d+】/g, "");
  }
  if (opts.remove_line_breaks) {
    t = t.replace(/(\r\n|\n|\r)/gm, "");
    return t.trim().replace(/\s+/g, " ");
  }
  return t.trim().replace(/[ \t]+/g, " ");
}

function errorResponse(message, status, code) {
  return new Response(JSON.stringify({ error: { message: message, type: "api_error", code: code } }), {
    status: status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function getTestPageHTML() {
  var voiceCatalogJson = JSON.stringify(VOICE_CATALOG);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TTS 测试</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 760px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #333; margin: 0 0 24px; font-size: 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-weight: 500; margin-bottom: 6px; color: #333; }
    input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: #fff; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #007bff; }
    textarea { min-height: 100px; resize: vertical; }
    .row, .voice-grid, .options-grid { display: flex; gap: 12px; }
    .row > *, .voice-grid > *, .options-grid > * { flex: 1; min-width: 0; }
    .voice-grid { align-items: flex-end; }
    .voice-field-language { flex: 1.25; }
    .voice-field-type { flex: 0.8; }
    .voice-field-voice { flex: 1.4; }
    .slider-wrap { display: flex; align-items: center; gap: 10px; }
    .slider-wrap input[type="range"] { flex: 1; }
    .slider-wrap span { min-width: 40px; text-align: right; font-weight: 500; }
    .section-title { margin: 4px 0 12px; font-size: 15px; font-weight: 600; color: #333; }
    .checkbox-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; margin-bottom: 12px; }
    .checkbox-grid label { display: flex; align-items: center; gap: 8px; margin: 0; font-weight: 400; }
    .checkbox-grid input { width: auto; }
    .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-primary { background: #007bff; color: #fff; }
    .btn-primary:hover { background: #0056b3; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
    #status { margin-top: 16px; padding: 12px; border-radius: 8px; text-align: center; display: none; }
    .status-error { background: #fee; color: #c00; }
    .status-success { background: #efe; color: #060; }
    .status-loading { background: #eef; color: #006; }
    audio { width: 100%; margin-top: 16px; display: none; }
    .api-info { margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px; font-size: 13px; }
    .api-info code { background: #e9ecef; padding: 2px 6px; border-radius: 4px; }
    @media (max-width: 640px) {
      body { padding: 12px; }
      .container { padding: 18px; }
      .row, .voice-grid, .options-grid { display: block; }
      .checkbox-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>TTS 测试</h1>
    <div class="form-group">
      <label>API Key</label>
      <input type="password" id="apiKey" placeholder="输入你的 API Key">
    </div>
    <div class="form-group">
      <label>文本内容</label>
      <textarea id="text" placeholder="输入要转换的文本...">你好，这是一个语音合成测试。</textarea>
    </div>
    <div class="voice-grid">
      <div class="form-group voice-field-language">
        <label>Language</label>
        <select id="language"></select>
      </div>
      <div class="form-group voice-field-type">
        <label>Type</label>
        <select id="voiceType"></select>
      </div>
      <div class="form-group voice-field-voice">
        <label>Voices</label>
        <select id="voice"></select>
      </div>
    </div>
    <div class="options-grid">
      <div class="form-group">
        <label>Style</label>
        <select id="style"></select>
      </div>
      <div class="form-group">
        <label>Role</label>
        <select id="role"></select>
      </div>
    </div>
    <div class="row">
      <div class="form-group">
        <label>语速</label>
        <div class="slider-wrap">
          <input type="range" id="speed" min="0.5" max="2" step="0.1" value="1">
          <span id="speedVal">1.0</span>
        </div>
      </div>
      <div class="form-group">
        <label>音调</label>
        <div class="slider-wrap">
          <input type="range" id="pitch" min="0.5" max="2" step="0.1" value="1.1">
          <span id="pitchVal">1.1</span>
        </div>
      </div>
    </div>
    <div class="form-group">
      <div class="section-title">文本清洗</div>
      <div class="checkbox-grid">
        <label><input type="checkbox" id="cleanMarkdown" checked>Markdown</label>
        <label><input type="checkbox" id="cleanEmoji" checked>Emoji</label>
        <label><input type="checkbox" id="cleanUrls" checked>URLs</label>
        <label><input type="checkbox" id="cleanCitations" checked>引用编号</label>
        <label><input type="checkbox" id="cleanLineBreaks">换行</label>
      </div>
      <input type="text" id="customKeywords" placeholder="自定义关键词，用英文逗号分隔">
    </div>
    <button class="btn btn-primary" id="generateBtn" onclick="generate()">生成语音</button>
    <div id="status"></div>
    <audio id="player" controls></audio>
    <div class="api-info">
      <strong>API 端点：</strong><code id="endpoint"></code>
    </div>
  </div>
  <script>
    var VOICE_CATALOG = ${voiceCatalogJson};
    var $ = function(id) { return document.getElementById(id); };
    $("endpoint").textContent = location.origin + "/v1/audio/speech";
    $("apiKey").value = localStorage.getItem("tts_api_key") || "";
    $("pitch").value = localStorage.getItem("tts_pitch") || "1.1";
    $("pitchVal").textContent = parseFloat($("pitch").value).toFixed(1);
    $("speed").value = localStorage.getItem("tts_speed") || "1";
    $("speedVal").textContent = parseFloat($("speed").value).toFixed(1);
    $("speed").oninput = function() { $("speedVal").textContent = parseFloat($("speed").value).toFixed(1); };
    $("pitch").oninput = function() { $("pitchVal").textContent = parseFloat($("pitch").value).toFixed(1); };

    function uniqueValues(rows, field) {
      var seen = {};
      var values = [];
      for (var i = 0; i < rows.length; i++) {
        var value = rows[i][field];
        if (!seen[value]) {
          seen[value] = true;
          values.push(value);
        }
      }
      return values;
    }

    function rowsFor(language, type) {
      var rows = [];
      for (var i = 0; i < VOICE_CATALOG.length; i++) {
        var row = VOICE_CATALOG[i];
        if (language && row.language !== language) continue;
        if (type && row.type !== type) continue;
        rows.push(row);
      }
      return rows;
    }

    function setOptions(select, items, getValue, getLabel, selectedValue) {
      select.innerHTML = "";
      for (var i = 0; i < items.length; i++) {
        var option = document.createElement("option");
        option.value = getValue(items[i]);
        option.textContent = getLabel(items[i]);
        if (option.value === selectedValue) option.selected = true;
        select.appendChild(option);
      }
    }

    function findVoiceRow(voice) {
      for (var i = 0; i < VOICE_CATALOG.length; i++) {
        if (VOICE_CATALOG[i].voice === voice) return VOICE_CATALOG[i];
      }
      return null;
    }

    function selectedVoiceRow() {
      return findVoiceRow($("voice").value);
    }

    function updateTypes(selectedType, selectedVoice, selectedStyle, selectedRole) {
      var language = $("language").value;
      var types = uniqueValues(rowsFor(language), "type");
      setOptions($("voiceType"), types, function(type) { return type; }, function(type) { return type; }, selectedType || types[0]);
      updateVoices(selectedVoice, selectedStyle, selectedRole);
    }

    function updateVoices(selectedVoice, selectedStyle, selectedRole) {
      var language = $("language").value;
      var type = $("voiceType").value;
      var voices = rowsFor(language, type);
      setOptions(
        $("voice"),
        voices,
        function(row) { return row.voice; },
        function(row) { return row.voice + (row.gender ? " - " + row.gender : "") + " [" + row.locale + "]"; },
        selectedVoice || (voices[0] ? voices[0].voice : "")
      );
      updateStyleRole(selectedStyle, selectedRole);
    }

    function updateStyleRole(selectedStyle, selectedRole) {
      var row = selectedVoiceRow();
      var styles = row && row.styles.length ? ["general"].concat(row.styles) : ["general"];
      var preferredStyle = selectedStyle || localStorage.getItem("tts_style") || "cheerful";
      if (styles.indexOf(preferredStyle) === -1) preferredStyle = styles.indexOf("cheerful") === -1 ? "general" : "cheerful";
      setOptions($("style"), styles, function(style) { return style; }, function(style) { return style; }, preferredStyle);

      var roles = row && row.roles.length ? [""].concat(row.roles) : [""];
      var preferredRole = selectedRole || localStorage.getItem("tts_role") || "";
      if (roles.indexOf(preferredRole) === -1) preferredRole = "";
      setOptions($("role"), roles, function(role) { return role; }, function(role) { return role || "default"; }, preferredRole);
      $("role").disabled = roles.length === 1;
    }

    function loadCheckbox(id, storageKey, defaultValue) {
      var saved = localStorage.getItem(storageKey);
      $(id).checked = saved === null ? defaultValue : saved === "true";
      $(id).onchange = function() { localStorage.setItem(storageKey, $(id).checked ? "true" : "false"); };
    }

    function initVoiceFilters() {
      var savedVoice = localStorage.getItem("tts_voice") || "zh-CN-XiaoxiaoNeural";
      var selected = findVoiceRow(savedVoice) || findVoiceRow("zh-CN-XiaoxiaoNeural") || VOICE_CATALOG[0];
      var languages = uniqueValues(VOICE_CATALOG, "language");
      setOptions($("language"), languages, function(language) { return language; }, function(language) { return language; }, selected.language);
      updateTypes(selected.type, selected.voice, localStorage.getItem("tts_style") || "cheerful", localStorage.getItem("tts_role") || "");
      $("language").onchange = function() { updateTypes(); };
      $("voiceType").onchange = function() { updateVoices(); };
      $("voice").onchange = function() { localStorage.setItem("tts_voice", $("voice").value); updateStyleRole(); };
      $("style").onchange = function() { localStorage.setItem("tts_style", $("style").value); };
      $("role").onchange = function() { localStorage.setItem("tts_role", $("role").value); };
    }

    initVoiceFilters();
    loadCheckbox("cleanMarkdown", "tts_clean_markdown", true);
    loadCheckbox("cleanEmoji", "tts_clean_emoji", true);
    loadCheckbox("cleanUrls", "tts_clean_urls", true);
    loadCheckbox("cleanCitations", "tts_clean_citations", true);
    loadCheckbox("cleanLineBreaks", "tts_clean_line_breaks", false);
    $("customKeywords").value = localStorage.getItem("tts_custom_keywords") || "";

    function showStatus(msg, type) {
      $("status").textContent = msg;
      $("status").className = "status-" + type;
      $("status").style.display = "block";
    }
    function generate() {
      var apiKey = $("apiKey").value.trim();
      var text = $("text").value.trim();
      var voice = $("voice").value;
      var style = $("style").value;
      var role = $("role").value;
      var customKeywords = $("customKeywords").value.trim();
      if (!apiKey) { showStatus("请输入 API Key", "error"); return; }
      if (!text) { showStatus("请输入文本", "error"); return; }
      if (!voice) { showStatus("请选择语音", "error"); return; }
      localStorage.setItem("tts_api_key", apiKey);
      localStorage.setItem("tts_voice", voice);
      localStorage.setItem("tts_speed", $("speed").value);
      localStorage.setItem("tts_pitch", $("pitch").value);
      localStorage.setItem("tts_style", style);
      localStorage.setItem("tts_role", role);
      localStorage.setItem("tts_custom_keywords", customKeywords);
      $("generateBtn").disabled = true;
      $("player").style.display = "none";
      showStatus("生成中...", "loading");
      fetch(location.origin + "/v1/audio/speech", {
        method: "POST",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "tts-1",
          voice: voice,
          input: text,
          speed: parseFloat($("speed").value),
          pitch: parseFloat($("pitch").value),
          style: style,
          role: role,
          cleaning_options: {
            remove_markdown: $("cleanMarkdown").checked,
            remove_emoji: $("cleanEmoji").checked,
            remove_urls: $("cleanUrls").checked,
            remove_line_breaks: $("cleanLineBreaks").checked,
            remove_citation_numbers: $("cleanCitations").checked,
            custom_keywords: customKeywords
          }
        })
      }).then(function(res) {
        if (!res.ok) return res.json().then(function(e) { throw new Error(e.error ? e.error.message : "HTTP " + res.status); });
        return res.blob();
      }).then(function(blob) {
        $("player").src = URL.createObjectURL(blob);
        $("player").style.display = "block";
        $("player").play();
        showStatus("生成成功", "success");
      }).catch(function(e) {
        showStatus("错误: " + e.message, "error");
      }).finally(function() {
        $("generateBtn").disabled = false;
      });
    }
  </script>
</body>
</html>`;
}