/*
 * Aufgaben-Datenbank: If-Sätze Typ 2 (Conditional sentences type 2)
 * Grundlage: Language File LF 17 (Klasse 8)
 *
 * Alle Inhalte sind reine Daten – neue Aufgaben können einfach ergänzt werden.
 * IDs ergeben sich aus "<typ>:<index>" – beim Ergänzen bitte nur hinten anhängen,
 * damit gespeicherte Fehlerlisten gültig bleiben.
 */
window.IF2_DATA = {

  /* ---------- Lückentext ----------
   * s: Satz, {} = Lücke (Reihenfolge entspricht a / r)
   * a: Lösungen je Lücke, Alternativen mit "|" getrennt
   *    (Kurzformen wie 'd / wouldn't / didn't werden automatisch akzeptiert)
   * r: Rolle je Lücke: i = if-Satz (Bedingung), m = Hauptsatz (Folge), q = Frage im Hauptsatz
   */
  gap: [
    { s: "If I {} (have) enough money, I {} (travel) everywhere.", a: ["had", "would travel"], r: "im" },
    { s: "If my friend Tina {} (win) a ticket, she {} (not use) it.", a: ["won", "would not use"], r: "im" },
    { s: "I {} (be) really happy if I {} (go) on a trip round the world.", a: ["would be", "went"], r: "mi" },
    { s: "What {} (you / do) if you {} (win) the lottery?", a: ["would you do", "won"], r: "qi" },
    { s: "If we {} (live) by the sea, we {} (go) swimming every day.", a: ["lived", "would go"], r: "im" },
    { s: "If he {} (study) more, he {} (get) better marks.", a: ["studied", "would get"], r: "im" },
    { s: "If it {} (not rain) so much, we {} (play) outside.", a: ["did not rain", "would play"], r: "im" },
    { s: "She {} (help) you if she {} (have) time.", a: ["would help", "had"], r: "mi" },
    { s: "If I {} (be) you, I {} (tell) the teacher.", a: ["were|was", "would tell"], r: "im" },
    { s: "If they {} (know) the answer, they {} (put up) their hands.", a: ["knew", "would put up"], r: "im" },
    { s: "If my parents {} (let) me, I {} (get) a dog.", a: ["let", "would get"], r: "im" },
    { s: "If you {} (be) travelling around the world, you {} (can / forget) about school.", a: ["were", "could forget"], r: "im" },
    { s: "If I {} (speak) Chinese, I {} (can / work) in Beijing.", a: ["spoke", "could work"], r: "im" },
    { s: "We {} (not be) late if the bus {} (come) on time.", a: ["would not be", "came"], r: "mi" },
    { s: "If Tom {} (find) a wallet, he {} (take) it to the police.", a: ["found", "would take"], r: "im" },
    { s: "If I {} (can) fly, I {} (visit) my grandma every weekend.", a: ["could", "would visit"], r: "im" },
    { s: "If you {} (eat) more vegetables, you {} (feel) better.", a: ["ate", "would feel"], r: "im" },
    { s: "If she {} (not be) so shy, she {} (talk) to him.", a: ["were not|was not", "would talk"], r: "im" },
    { s: "{} (you / come) to my party if I {} (invite) you?", a: ["would you come", "invited"], r: "qi" },
    { s: "If our school {} (have) a pool, I {} (swim) every day.", a: ["had", "would swim"], r: "im" },
    { s: "If I {} (meet) a famous singer, I {} (ask) for an autograph.", a: ["met", "would ask"], r: "im" },
    { s: "My dad {} (buy) a new car if he {} (earn) more money.", a: ["would buy", "earned"], r: "mi" },
    { s: "If you {} (go) to bed earlier, you {} (not be) so tired.", a: ["went", "would not be"], r: "im" },
    { s: "If we {} (win) the match, we {} (celebrate) all night.", a: ["won", "would celebrate"], r: "im" },
    { s: "If I {} (forget) my homework, my teacher {} (be) angry.", a: ["forgot", "would be"], r: "im" },
    { s: "If he {} (see) a ghost, he {} (run) away.", a: ["saw", "would run"], r: "im" },
    { s: "If I {} (not have) a phone, I {} (read) more books.", a: ["did not have", "would read"], r: "im" },
    { s: "If my sister {} (write) a book, I {} (read) it.", a: ["wrote", "would read"], r: "im" },
    { s: "If you {} (lose) your key, what {} (you / do)?", a: ["lost", "would you do"], r: "iq" },
    { s: "If the weather {} (be) better, we {} (have) a picnic.", a: ["were|was", "would have"], r: "im" },
    { s: "If I {} (give) you 100 euros, what {} (you / buy)?", a: ["gave", "would you buy"], r: "iq" },
    { s: "Lisa {} (not go) to the party if she {} (feel) ill.", a: ["would not go", "felt"], r: "mi" },
    { s: "If people {} (drive) less, the air {} (be) cleaner.", a: ["drove", "would be"], r: "im" },
    { s: "If I {} (get) a new phone for my birthday, I {} (be) so happy.", a: ["got", "would be"], r: "im" },
    { s: "If we {} (take) the train, we {} (arrive) earlier.", a: ["took", "would arrive"], r: "im" },
    { s: "If they {} (build) a skate park here, lots of kids {} (come).", a: ["built", "would come"], r: "im" },
    { s: "If I {} (know) her number, I {} (call) her.", a: ["knew", "would call"], r: "im" },
    { s: "If you {} (practise) every day, you {} (can / play) the guitar really well.", a: ["practised|practiced", "could play"], r: "im" },
    { s: "If I {} (have) a time machine, I {} (travel) back to the Middle Ages.", a: ["had", "would travel"], r: "im" },
    { s: "If he {} (not spend) all his money on games, he {} (can / buy) a bike.", a: ["did not spend", "could buy"], r: "im" }
  ],

  /* ---------- Multiple Choice ----------
   * q: Frage, o: Optionen (o[0] ist richtig – wird beim Anzeigen gemischt), e: Erklärung
   */
  mc: [
    { q: "If I ___ a dog, I would call it Max.", o: ["had", "have", "would have", "will have"], e: "Im if-Satz (Bedingung) steht das simple past: had." },
    { q: "If she won the lottery, she ___ a big house.", o: ["would buy", "buys", "bought", "will buy"], e: "Im Hauptsatz (Folge) steht would + Infinitiv." },
    { q: "If you ___ harder, you would pass the test.", o: ["studied", "study", "would study", "will study"], e: "Bedingung → simple past: studied." },
    { q: "If I ___ you, I wouldn't do that.", o: ["were", "am", "would be", "be"], e: "„If I were you …“ – feste Wendung für Ratschläge („Wenn ich du wäre …“)." },
    { q: "We ___ to the beach if it were warmer.", o: ["would go", "went", "will go", "go"], e: "Der Hauptsatz steht hier vorne – trotzdem: would + Infinitiv." },
    { q: "If he ___ the answer, he would tell us.", o: ["knew", "knows", "would know", "know"], e: "know – knew – known: im if-Satz das simple past knew." },
    { q: "They ___ late if they took the bus.", o: ["wouldn't be", "weren't", "won't be", "aren't"], e: "Verneinte Folge: wouldn't + Infinitiv." },
    { q: "___ you help me if I asked you?", o: ["Would", "Will", "Did", "Do"], e: "Fragen im Typ 2 bildest du mit Would + Subjekt + Infinitiv." },
    { q: "If I had more time, I ___ learn to play the piano.", o: ["could", "can", "will", "am"], e: "Statt would kann im Hauptsatz auch could („könnte“) + Infinitiv stehen." },
    { q: "If it ___ so cold, we would go for a walk.", o: ["weren't", "isn't", "wouldn't be", "won't be"], e: "Verneinte Bedingung im simple past: weren't (wasn't)." },
    { q: "If my parents ___ me more pocket money, I would save it.", o: ["gave", "give", "would give", "will give"], e: "give – gave – given: simple past gave." },
    { q: "What would you do if you ___ a famous person?", o: ["met", "meet", "would meet", "will meet"], e: "meet – met – met: Bedingung im simple past." },
    { q: "If we lived in London, we ___ Big Ben every day.", o: ["could see", "can see", "saw", "will see"], e: "could + Infinitiv = „könnten … sehen“." },
    { q: "Welcher Satz ist richtig?", o: ["If I had wings, I would fly.", "If I would have wings, I would fly.", "If I had wings, I will fly.", "If I have wings, I would fly."], e: "if-Satz: simple past – Hauptsatz: would + Infinitiv. Niemals would im if-Satz!" },
    { q: "Welcher Satz ist richtig?", o: ["I'd travel a lot if I had the money.", "I'd travel a lot, if I had the money.", "I travel a lot if I had the money.", "I'd travel a lot if I would have the money."], e: "Steht der if-Satz hinten, kommt kein Komma davor." },
    { q: "„I'd go“ ist im Typ 2 die Kurzform von …", o: ["I would go", "I had go", "I did go", "I could go"], e: "'d ist die Kurzform von would (im Hauptsatz)." },
    { q: "Would she come to the party? – No, she ___.", o: ["wouldn't", "didn't", "won't", "doesn't"], e: "Kurzantwort mit would: No, she wouldn't." },
    { q: "Would your friends like the film? – Yes, they ___.", o: ["would", "will", "do", "like"], e: "Kurzantwort: Yes, they would." },
    { q: "If Tom ___ his homework, his teacher wouldn't be angry.", o: ["did", "does", "would do", "will do"], e: "do – did – done: Bedingung im simple past." },
    { q: "If I found a wallet in the street, I ___ it to the police.", o: ["would take", "took", "will take", "take"], e: "Folge → would + Infinitiv." },
    { q: "If you ___ less sugar, you would be healthier.", o: ["ate", "eat", "would eat", "will eat"], e: "eat – ate – eaten: simple past ate." },
    { q: "Wann benutzt du if-Sätze Typ 2?", o: ["Wenn die Bedingung unwahrscheinlich oder nur gedacht ist", "Wenn etwas sehr wahrscheinlich passiert", "Für abgeschlossene Handlungen in der Vergangenheit", "Für regelmäßige Gewohnheiten"], e: "Typ 2: „Was wäre, wenn …?“ – unwahrscheinliche oder unsichere Bedingungen." },
    { q: "Welche Zeitform steht im if-Satz (Typ 2)?", o: ["simple past", "would + Infinitiv", "simple present", "will-future"], e: "Die Bedingung steht im simple past." },
    { q: "Was steht im Hauptsatz (Typ 2)?", o: ["would / could + Infinitiv", "simple past", "will + Infinitiv", "present perfect"], e: "Die Folge: would (’d) bzw. wouldn't + Infinitiv – oder could + Infinitiv." },
    { q: "If she ___ so busy, she would visit us more often.", o: ["weren't", "isn't", "won't be", "wouldn't be"], e: "Bedingung im simple past: weren't (umgangssprachlich auch wasn't)." },
    { q: "My brother would be happier if he ___ more friends.", o: ["had", "has", "would have", "will have"], e: "if-Satz → simple past had." },
    { q: "If there ___ no school tomorrow, I would sleep until noon.", o: ["were", "is", "will be", "would be"], e: "there were / there was – simple past im if-Satz." },
    { q: "Where would you live if you ___ choose?", o: ["could", "can", "will", "would"], e: "could ist das simple past von can und passt in den if-Satz." },
    { q: "„Wenn ich Zeit hätte, würde ich dir helfen.“ Auf Englisch:", o: ["If I had time, I would help you.", "If I would have time, I would help you.", "If I have time, I will help you.", "If I had time, I helped you."], e: "Deutsch: hätte/würde – Englisch: simple past im if-Satz, would im Hauptsatz." },
    { q: "„Würdest du eine Weltreise machen, wenn du die Chance hättest?“", o: ["Would you go on a trip around the world if you had the chance?", "Will you go on a trip around the world if you have the chance?", "Would you go on a trip around the world if you would have the chance?", "Did you go on a trip around the world if you had the chance?"], e: "Frage: Would + Subjekt + Infinitiv … if + simple past." }
  ],

  /* ---------- Satzbau (Deutsch → Englisch mit Wortbausteinen) ----------
   * de: deutscher Satz, en: Lösung (Bausteine = Wörter), x: Ablenker-Bausteine
   */
  order: [
    { de: "Wenn ich genug Geld hätte, würde ich überall hinreisen.", en: "If I had enough money, I would travel everywhere.", x: ["have", "will"] },
    { de: "Ich wäre wirklich glücklich, wenn ich eine Weltreise machen würde.", en: "I would be really happy if I went on a trip round the world.", x: ["go", "will"] },
    { de: "Wenn meine Freundin Tina ein Ticket gewinnen würde, würde sie es nicht nutzen.", en: "If my friend Tina won a ticket, she wouldn't use it.", x: ["wins", "didn't"] },
    { de: "Würdest du eine Weltreise machen, wenn du die Chance hättest?", en: "Would you go on a trip around the world if you had the chance?", x: ["Will", "have"] },
    { de: "Wenn du um die Welt reisen würdest, könntest du die Schule vergessen.", en: "If you were travelling around the world, you could forget about school.", x: ["can", "are"] },
    { de: "Wenn ich du wäre, würde ich das nicht tun.", en: "If I were you, I wouldn't do that.", x: ["am", "won't"] },
    { de: "Wenn es nicht regnen würde, würden wir Fußball spielen.", en: "If it didn't rain, we would play football.", x: ["doesn't", "will"] },
    { de: "Was würdest du tun, wenn du im Lotto gewinnen würdest?", en: "What would you do if you won the lottery?", x: ["will", "win"] },
    { de: "Wenn wir einen Hund hätten, würden wir jeden Tag spazieren gehen.", en: "If we had a dog, we would go for a walk every day.", x: ["have", "will"] },
    { de: "Er würde bessere Noten bekommen, wenn er mehr lernen würde.", en: "He would get better marks if he studied more.", x: ["studies", "will"] },
    { de: "Wenn ich fliegen könnte, würde ich nach Amerika fliegen.", en: "If I could fly, I would fly to America.", x: ["can", "will"] },
    { de: "Sie würde dir helfen, wenn sie Zeit hätte.", en: "She would help you if she had time.", x: ["has", "helps"] },
    { de: "Wenn das Wetter besser wäre, könnten wir ein Picknick machen.", en: "If the weather were better, we could have a picnic.", x: ["is", "can"] },
    { de: "Wenn ich ihre Nummer wüsste, würde ich sie anrufen.", en: "If I knew her number, I would call her.", x: ["know", "will"] },
    { de: "Würdest du mir helfen, wenn ich dich fragen würde?", en: "Would you help me if I asked you?", x: ["Will", "ask"] },
    { de: "Wir würden nicht zu spät kommen, wenn der Bus pünktlich wäre.", en: "We wouldn't be late if the bus were on time.", x: ["won't", "is"] },
    { de: "Wenn ich eine Zeitmaschine hätte, würde ich die Dinosaurier besuchen.", en: "If I had a time machine, I would visit the dinosaurs.", x: ["have", "will"] },
    { de: "Wenn du früher ins Bett gehen würdest, wärst du nicht so müde.", en: "If you went to bed earlier, you wouldn't be so tired.", x: ["go", "aren't"] },
    { de: "Wenn er einen Geist sehen würde, würde er weglaufen.", en: "If he saw a ghost, he would run away.", x: ["sees", "will"] },
    { de: "Ich würde um ein Autogramm bitten, wenn ich einen Star treffen würde.", en: "I would ask for an autograph if I met a star.", x: ["meet", "will"] },
    { de: "Wenn wir am Meer wohnen würden, könnten wir jeden Tag schwimmen gehen.", en: "If we lived by the sea, we could go swimming every day.", x: ["live", "can"] },
    { de: "Wenn ich Chinesisch sprechen würde, könnte ich in Peking arbeiten.", en: "If I spoke Chinese, I could work in Beijing.", x: ["speak", "can"] },
    { de: "Wenn meine Eltern es mir erlauben würden, würde ich eine Katze bekommen.", en: "If my parents let me, I would get a cat.", x: ["lets", "will"] },
    { de: "Wenn ich du wäre, würde ich mich entschuldigen.", en: "If I were you, I would apologise.", x: ["am", "will"] }
  ],

  /* ---------- Fehlerjagd ----------
   * p: Satzteile, w: Index des falschen Teils (-1 = Satz ist korrekt), f: Korrektur, e: Erklärung
   */
  error: [
    { p: ["If I", "would have", "more time,", "I would", "read more books."], w: 1, f: "had", e: "Im if-Satz steht nie would – sondern das simple past." },
    { p: ["If she", "won", "the lottery,", "she", "will buy", "a horse."], w: 4, f: "would buy", e: "Typ 2: Im Hauptsatz steht would + Infinitiv, nicht will." },
    { p: ["If we", "lived", "in Spain,", "we", "would speak", "Spanish."], w: -1, e: "Alles richtig: simple past im if-Satz, would + Infinitiv im Hauptsatz." },
    { p: ["I would", "help you", "if I", "have", "more time."], w: 3, f: "had", e: "Bedingung im simple past: had." },
    { p: ["If he", "knew", "the answer,", "he", "tells", "us."], w: 4, f: "would tell", e: "Folge → would + Infinitiv." },
    { p: ["Would", "you", "come", "if I", "invite", "you?"], w: 4, f: "invited", e: "Auch in Fragen steht im if-Satz das simple past." },
    { p: ["If I", "were", "you,", "I", "wouldn't", "worry."], w: -1, e: "Korrekt – „If I were you“ ist die typische Ratschlag-Wendung." },
    { p: ["If they", "would win", "the match,", "they", "would", "celebrate."], w: 1, f: "won", e: "Kein would im if-Satz! win – won – won." },
    { p: ["If you", "ate", "more fruit,", "you", "would felt", "better."], w: 4, f: "would feel", e: "Nach would steht der Infinitiv (Grundform): would feel." },
    { p: ["If my dog", "could", "talk,", "it", "would tell", "funny stories."], w: -1, e: "Korrekt – could ist das simple past von can." },
    { p: ["I'd", "travel", "a lot,", "if", "I had", "the money."], w: 2, f: "a lot", e: "Steht der if-Satz hinten, kommt kein Komma davor." },
    { p: ["If I", "had", "a car,", "I", "would drove", "to Italy."], w: 4, f: "would drive", e: "would + Infinitiv: would drive." },
    { p: ["If it", "didn't", "rain,", "we", "would play", "outside."], w: -1, e: "Korrekt – verneinte Bedingung im simple past (didn't + Infinitiv)." },
    { p: ["If she", "has", "a phone,", "she", "would call", "her mum."], w: 1, f: "had", e: "Typ 2: simple past im if-Satz → had." },
    { p: ["We", "could", "go", "to the cinema", "if we", "would have", "money."], w: 5, f: "had", e: "Im if-Satz kein would – simple past: had." },
    { p: ["If he", "studied", "more,", "he", "would get", "better marks."], w: -1, e: "Korrekt!" },
    { p: ["If I", "finded", "a wallet,", "I", "would take", "it to the police."], w: 1, f: "found", e: "find ist unregelmäßig: find – found – found." },
    { p: ["Would", "you", "like", "it", "if we", "moved", "to Berlin?"], w: -1, e: "Korrekt – Frage mit Would, Bedingung im simple past." },
    { p: ["If you", "went", "to bed earlier,", "you", "won't be", "so tired."], w: 4, f: "wouldn't be", e: "Typ 2 verneint: wouldn't + Infinitiv (nicht won't)." },
    { p: ["If my parents", "let", "me,", "I", "would", "got", "a dog."], w: 5, f: "get", e: "Nach would folgt der Infinitiv: would get." },
    { p: ["If we", "had", "a pool,", "we", "would swim", "every day."], w: -1, e: "Korrekt!" },
    { p: ["If I", "can", "fly,", "I", "would visit", "my grandma."], w: 1, f: "could", e: "Bedingung im simple past: can → could." }
  ],

  /* ---------- Satzhälften (für „Verbinden“ und „Komma-Check“) ----------
   * [if-Satz, Hauptsatz] – Hauptsatz klein (außer I), ohne Punkt
   */
  pairs: [
    ["If I had wings", "I would fly over the Alps"],
    ["If it snowed in July", "everybody would be surprised"],
    ["If I won the lottery", "I would buy a villa in Spain"],
    ["If my dog could talk", "it would tell me its secrets"],
    ["If we had a pool in our garden", "we would swim every day"],
    ["If I met a famous footballer", "I would ask for an autograph"],
    ["If you studied harder", "you would get better marks"],
    ["If the bus came on time", "we wouldn't be late for school"],
    ["If I spoke French", "I could talk to people in Paris"],
    ["If she had a guitar", "she would play songs all day"],
    ["If there were no cars", "the air would be much cleaner"],
    ["If I were invisible", "I would sneak into the cinema"],
    ["If they lived by the sea", "they would go surfing every weekend"],
    ["If he were really hungry", "he would eat a whole pizza"],
    ["If I had a time machine", "I would visit the dinosaurs"],
    ["If my parents let me", "I would get a cat"],
    ["If you went to bed earlier", "you wouldn't be so tired"],
    ["If it didn't rain so much", "we could play football outside"],
    ["If I knew her number", "I would call her"],
    ["If we didn't have homework", "we would have more free time"],
    ["If I found a wallet", "I would take it to the police"],
    ["If our teacher were ill", "we wouldn't write the English test"],
    ["If I could cook", "I would make pancakes for everyone"],
    ["If computers didn't exist", "life would be very different"],
    ["If I had a robot", "it would tidy up my room"],
    ["If you ate less chocolate", "you would be healthier"],
    ["If my sister borrowed my clothes", "I would be angry"],
    ["If we took the train", "we would arrive faster"]
  ],

  /* ---------- Kurzantworten ----------
   * q: Frage, p: Pronomen für die Antwort
   */
  short: [
    { q: "Would you go on a trip around the world if you had the chance?", p: "I" },
    { q: "Would Tina use the ticket if she won it?", p: "she" },
    { q: "Would your parents buy you a dog if you asked them?", p: "they" },
    { q: "Would Tom help us if we asked him?", p: "he" },
    { q: "Would you and your friends go to the concert if it were free?", p: "we" },
    { q: "Would it be fun if we had no school?", p: "it" },
    { q: "Would your teacher be angry if you forgot your homework?", p: "she" },
    { q: "Would you learn Chinese if you had more time?", p: "I" },
    { q: "Would your brother eat insects if he were very hungry?", p: "he" },
    { q: "Would the kids play outside if it stopped raining?", p: "they" },
    { q: "Would you lend me your bike if I needed it?", p: "I" },
    { q: "Would Lisa come to the party if we invited her?", p: "she" },
    { q: "Would your dog bark if a stranger came in?", p: "it" },
    { q: "Would you live in New York if you could?", p: "I" },
    { q: "Would Max and Ben win if they trained more?", p: "they" },
    { q: "Would your grandpa use a smartphone if he had one?", p: "he" }
  ],

  /* ---------- Typ 1 oder Typ 2? ----------
   * s: Satz, t: 1 oder 2
   */
  type: [
    { s: "If it rains tomorrow, we will stay at home.", t: 1 },
    { s: "If you hurry, you will catch the bus.", t: 1 },
    { s: "If I see Tom, I'll give him your message.", t: 1 },
    { s: "She will be angry if you don't call her.", t: 1 },
    { s: "If we leave now, we won't be late.", t: 1 },
    { s: "If I get good marks, my parents will be happy.", t: 1 },
    { s: "If the weather is nice on Saturday, we'll have a barbecue.", t: 1 },
    { s: "They will win if they play well.", t: 1 },
    { s: "If you don't take an umbrella, you'll get wet.", t: 1 },
    { s: "Will you help me if I ask you?", t: 1 },
    { s: "If I had a million euros, I would buy an island.", t: 2 },
    { s: "If dogs could talk, they would complain about cats.", t: 2 },
    { s: "If I were the head teacher, I'd make Friday a holiday.", t: 2 },
    { s: "We would go swimming if it were warmer.", t: 2 },
    { s: "If she lived in Paris, she could visit the Eiffel Tower every day.", t: 2 },
    { s: "If he didn't play so many video games, he'd have more time.", t: 2 },
    { s: "Would you be scared if you saw a ghost?", t: 2 },
    { s: "If I had wings, I would fly to school.", t: 2 },
    { s: "If I were you, I would apologise.", t: 2 },
    { s: "If you finish your homework, you can watch TV.", t: 1 }
  ],

  /* ---------- Unregelmäßige Verben (Theorie + Tipps) ---------- */
  irregular: [
    ["be", "was / were"], ["have", "had"], ["go", "went"], ["win", "won"],
    ["know", "knew"], ["see", "saw"], ["meet", "met"], ["find", "found"],
    ["eat", "ate"], ["give", "gave"], ["take", "took"], ["get", "got"],
    ["come", "came"], ["write", "wrote"], ["speak", "spoke"], ["can", "could"],
    ["buy", "bought"], ["feel", "felt"], ["forget", "forgot"], ["lose", "lost"],
    ["drive", "drove"], ["build", "built"], ["let", "let"], ["spend", "spent"]
  ]
};
