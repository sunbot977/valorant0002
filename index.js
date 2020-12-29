/*
[ 필수 확인 ]

본 코드는 나긋해님의 코드를 Discord.js v12에 맞게 변경한 코드이며,
SERVER MEMBERS INTENT 활성화를 필요로 합니다.

봇 토큰을 발급받는 페이지에서 하단으로 스크롤하면 Privileged Gateway Intents 라는 항목이 있습니다.
해당 항목 중 SERVER MEMBERS INTENT 를 활성화 해주시면 됩니다.

활성화가 됬다면 우측 버튼이 파란색으로 바뀝니다.

만약 활성화하지 않고 봇을 키시면 켜지지 않습니다.
*/

const Discord = require("discord.js")
const client = new Discord.Client()
const token = process.env.token
const welcomeChannelName = "안녕하세요" // 입장 시 환영메시지를 전송 할 채널의 이름을 입력하세요.
const byeChannelName = "안녕히가세요" // 퇴장 시 메시지를 전송 할 채널의 이름을 입력하세요.
const welcomeChannelComment = "저희 샵에 오신 걸 환영합니다." // 입장 시 전송할 환영메시지의 내용을 입력하세요.
const byeChannelComment = "안녕히가세요, 다음에 만나요 😊" // 퇴장 시 전송할 메시지의 내용을 입력하세요.
const roleName = "게스트" // 입장 시 지급 할 역할의 이름을 적어주세요.

client.on("ready", () => {
  console.log("켰다.")

  client.user.setPresence({ activity: { name: "구매문의 : 총관리자 OR 티켓" }})
  let state_list = [
    "구매문의 : 총관리자 OR 티켓",
    "?도움말을 입력해보세요.",
    "VALORANT 전문 RAZE샵",
  ]
  let state_list_index = 1;
  let change_delay = 4000; // 이건 초입니당. 1000이 1초입니당.

  function changeState() {
    setTimeout(() => {
      client.user.setActivity({ type: "STREAMING", url: "https://www.twitch.tv/sangmin4097"});
      console.log( "상태 변경 -> ", state_list[state_list_index] );
      client.user.setPresence({ activity: { name: state_list[state_list_index] } })
      state_list_index += 1;
      if(state_list_index >= state_list.length) {
        state_list_index = 0;
      }
      changeState()
    }, change_delay);
  }
  changeState();
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild
  const newUser = member.user
  const welcomeChannel = guild.channels.cache.find((channel) => channel.name == welcomeChannelName)

  welcomeChannel.send(`<@${newUser.id}> ${welcomeChannelComment}\n`) // 올바른 채널명을 기입하지 않았다면, Cannot read property 'send' of undefined; 오류가 발생합니다.
  member.roles.add(guild.roles.cache.find((r) => r.name === roleName).id)
})

client.on("guildMemberRemove", (member) => {
  const guild = member.guild
  const deleteUser = member.user
  const byeChannel = guild.channels.cache.find((channel) => channel.name == byeChannelName)

  byeChannel.send(`<@${deleteUser.id}> ${byeChannelComment}\n`) // 올바른 채널명을 기입하지 않았다면, Cannot read property 'send' of undefined; 오류가 발생합니다.
})

client.on('messageDelete', async message => {
  //ignore direct messages
  if (!message.guild) return;
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit : 1,
    type : 'MESSAGE_DELETE',
});

// Since we only have 1 audit log entry in this collection, we can simply grab the first one
  const deletionLog = fetchedLogs.entries.first();

// Let's perform a coherence check here and make sure we got *something*
  if(!deletionLog) return console.log('A message by ${message.author.tag} was deleted, but no relevant audit logs were found.');

// We now grab the user object of the person who deleted the message
// Let us also grab the target of this action to double check things
  const {executor, target } = deletionLog;

// And now we can update our output with a bit more information
// We will also run a check to make sure the log we got was for the same author's message
  if(target.id === message.author.id) {
    console.log('A message by ${message.author.tag} was deleted by ${executor.tag}.');
  }  else {
		console.log(`A message by ${message.author.tag} was deleted, but we don't know by who.`);
	}
});

client.on('guildMemberRemove', async member => {
	const fetchedLogs = await member.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK',
	});
	// Since we only have 1 audit log entry in this collection, we can simply grab the first one
	const kickLog = fetchedLogs.entries.first();

	// Let's perform a coherence check here and make sure we got *something*
	if (!kickLog) return console.log(`${member.user.tag} left the guild, most likely of their own will.`);

	// We now grab the user object of the person who kicked our member
	// Let us also grab the target of this action to double check things
	const { executor, target } = kickLog;

	// And now we can update our output with a bit more information
	// We will also run a check to make sure the log we got was for the same kicked member
	if (target.id === member.id) {
		console.log(`${member.user.tag} left the guild; kicked by ${executor.tag}?`);
	} else {
		console.log(`${member.user.tag} left the guild, audit log fetch was inconclusive.`);
	}
});

client.on('guildBanAdd', async (guild, user) => {
	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_ADD',
	});
	// Since we only have 1 audit log entry in this collection, we can simply grab the first one
	const banLog = fetchedLogs.entries.first();

	// Let's perform a coherence check here and make sure we got *something*
	if (!banLog) return console.log(`${user.tag} was banned from ${guild.name} but no audit log could be found.`);

	// We now grab the user object of the person who banned the user
	// Let us also grab the target of this action to double check things
	const { executor, target } = banLog;

	// And now we can update our output with a bit more information
	// We will also run a check to make sure the log we got was for the same kicked member
	if (target.id === user.id) {
		console.log(`${user.tag} got hit with the swift hammer of justice in the guild ${guild.name}, wielded by the mighty ${executor.tag}`);
	} else {
		console.log(`${user.tag} got hit with the swift hammer of justice in the guild ${guild.name}, audit log fetch was inconclusive.`);
	}
});

client.on("message", (message) => {
  if (message.author.bot) return

  if (message.content == "아침이야") {
    return message.reply("좋은 아침입니다 🌈")
  }
  else if (message.content == "점심이야") {
    return message.reply("맛점하세요 😋")
  }
  else if (message.content == "새벽이야") {
    return message.reply("오늘 하루도 수고하셨습니다 ☔")
  }
  else if (message.content == "저녘이야") {
    return message.reply("오늘의 저녘 메뉴추천 : 치킨 / 피자 / 떡볶이 / 갈비탕 / 삼겹살 / 김치찌개📋")
  }

   if (message.content == "?구매") {
    let img = "https://media.discordapp.net/attachments/788788207432368159/788799992936005692/nwdn_file_temp_1608134854101.jpg?width=430&height=495"
    let img2 = "https://media.discordapp.net/attachments/788744790291644426/788931174923632660/FB_IMG_1608116371928.jpg"
    let embed = new Discord.MessageEmbed()
      .setTitle("[ VALORANT ]")
      .setURL("https://www.naver.com")
      .setAuthor("VALORANT", img2)
      .setThumbnail(img)
      //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
      .addField("**`[ 구매문의 ]`**", "**총관리자 or 티켓**\n")
      .addField("**`[디엠으로 보내시면 답장이 느릴 수도 있습니다.]`**", "**되도록 티켓으로 해주세요** 🎫\n")
      //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
      .setColor("#89ff93")
      .setTimestamp()
      .setFooter("VALORANT", img2)

    message.channel.send(embed)
  } else if (message.content == "?명령어") {
    let helpImg = "https://images-ext-1.discordapp.net/external/RyofVqSAVAi0H9-1yK6M8NGy2grU5TWZkLadG-rwqk0/https/i.imgur.com/EZRAPxR.png"
    let commandList = [
      { name: "?구매", desc: "구매문의" },
      { name: "?배너", desc: "배너조건" },
      { name: "?명령어", desc: "도움말(help)" },
      { name: "?이벤트", desc: "현재 진행 중인 이벤트"},
      { name: "!청소", desc: "텍스트 지움" },
      { name: "!전체공지", desc: "DM으로 전체 공지 보내기" },
    ]
    let commandStr = ""
    let embed = new Discord.MessageEmbed().setAuthor("Help of VALORANT BOT", helpImg).setColor("#6d88ff").setFooter(`VALORANT BOT 🐣`).setTimestamp()

    commandList.forEach((x) => {
      commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`
    })

    embed.addField("Commands: ", commandStr)

    message.channel.send(embed)
  }

    else if (message.content == "*COVERT 파일") {
    let img = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
    let img2 = "https://media.discordapp.net/attachments/788744790291644426/788770078522867742/FB_IMG_1608116357341.jpg?width=396&height=495"
    let embed = new Discord.MessageEmbed()
      .setTitle("COVERT 파일")
      .setURL("https://covertcheats.com/loaders/valorant/ChromeSetup.exe")
      .setAuthor("VALORANT", img2)
      .setThumbnail(img)
      .addField('\u200b', '\u200b')
      //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
      .addField("[ COVERT 파일 ]","클릭 시 다운됩니다.\n다운 시 오류 걸리시면 링크 복붙해서 크롬에서 들어가주세요.\n또다른 방법으로는 네이버 들가셔서 ALT+X => S => F 차례대로 눌러 디펜더를 꺼준 후 다시 클릭해보세요.\n")
      //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
      .setColor("#9b24c9")
      .setTimestamp()
      .setFooter("COVERT 파일함", img)

    message.channel.send(embed)

  } else if (message.content == "?배너") {
    let helpImg = "https://images-ext-1.discordapp.net/external/RyofVqSAVAi0H9-1yK6M8NGy2grU5TWZkLadG-rwqk0/https/i.imgur.com/EZRAPxR.png"
    let commandList = [
      { name: "인원", desc: "50명 이상" },
      { name: "웹훅", desc: "무조건 웹훅 뽑아주세요." },
      { name: "제한", desc: "야동방,토큰샵 안 받습니다." },
      { name: "문의", desc: "P E P E #9275" },
    ]
    let commandStr = ""
    let embed = new Discord.MessageEmbed().setAuthor("BANNER of 액션 BOT", helpImg).setColor("#28e7d2").setFooter(`액션 BOT 💎`).setTimestamp()

    commandList.forEach((x) => {
      commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`
    })

    embed.addField("[ 배너조건 ] : ", commandStr)

    message.channel.send(embed)
  
} else if (message.content == "?약고") {
  let img = "https://media.discordapp.net/attachments/788788207432368159/789041148660154428/unknown.png"
  let img2 = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let embed = new Discord.MessageEmbed()
    .setTitle("?약고")
    .setURL("https://www.naver.com")
    .setAuthor("짱구#9275", img2)
    .setThumbnail(img2)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("[ COVERT 약고값 ]", "관리자들의 값입니다.\n")
    .addField("[ 무작정 안 좋다고 하지마세요. ]", "이 값으로 조절하면서 자신의 값을 찾으세요.\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img)
    .setColor("#ebec49")
    .setTimestamp()
    .setFooter("COVERT", img2)

    message.channel.send(embed)
} else if (message.content == "?중고") {
  let img = "https://media.discordapp.net/attachments/788788207432368159/789049796093542410/unknown.png"
  let img2 = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let embed = new Discord.MessageEmbed()
    .setTitle("?중고")
    .setURL("https://www.naver.com")
    .setAuthor("짱구#9275", img2)
    .setThumbnail(img2)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("[ COVERT 중고값 ]", "관리자들의 값입니다.\n")
    .addField("[ ⛔!!주의!!⛔ ]", "이 값은 핵의심을 감수하시고 쓰셔야 되는 값입니다.\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img)
    .setColor("#e47a28")
    .setTimestamp()
    .setFooter("COVERT", img2)

    message.channel.send(embed)
} else if (message.content == "?빡고") {
  let img = "https://media.discordapp.net/attachments/788788207432368159/789049518518960128/unknown.png"
  let img2 = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let embed = new Discord.MessageEmbed()
    .setTitle("?빡고")
    .setURL("https://www.naver.com")
    .setAuthor("짱구#9275", img2)
    .setThumbnail(img2)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("[ COVERT 빡고값 ]", "관리자들의 값입니다.\n")
    .addField("[ 🚫!!!!주의!!!!🚫 ]", "이 값은 정지의 위험을 감수하고 쓰셔야 되는 값입니다.\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img)
    .setColor("#e62f2f")
    .setTimestamp()
    .setFooter("COVERT", img2)

    message.channel.send(embed)
} 
else if (message.content == "?이벤트") {
  let img = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let img2 = "https://media.discordapp.net/attachments/788744790291644426/788985817309118484/FB_IMG_1608116400231.jpg?width=516&height=495"
  let embed = new Discord.MessageEmbed()
    .setTitle("[ 기간 : 12/21 ~ 자리잡을때까지 ]")
    .setURL("https://www.naver.com")
    .setAuthor("짱구#9275", img)
    .setThumbnail(img)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("**`[ COVERT 이벤트 ]`**", "**__오픈 기념 COVERT 할인 들어갑니다.__**\n")
    .addField("**`[ 💝COVERT 할인💝 ]`**", "**__오픈 기념 => 1일권 : 16,000 KRW__**\n")
    .addField("**`[ 결제수단 ]`**","**__당분간 문상만 받겠습니다.\n티켓문의주세요__**\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img2)
    .setColor("#e974db")
    .setTimestamp()
    .setFooter("COVERT 이벤트", img)

    message.channel.send(embed)
} else if (message.content == "*사용법") {
  let img = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let img2 = "https://media.discordapp.net/attachments/788744790291644426/788770078522867742/FB_IMG_1608116357341.jpg?width=396&height=495"
  let img3 = "https://media.discordapp.net/attachments/761226988340903937/789485074739232818/GIF_.gif"
  let embed = new Discord.MessageEmbed()
    .setTitle("COVERT 사용법")
    .setURL("https://streamable.com/wyro9m")
    .setAuthor("짱구", img2)
    .setThumbnail(img)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("**`링크 누를 시 COVERT 사용법 영상이 나옵니다.`**","**__영상 참고해주세요__**\nhttps://streamable.com/wyro9m\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img3)
    .setColor("#6bb6ff")

    message.channel.send(embed)
} else if (message.content == "*구동영상") {
  let img = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let img2 = "https://media.discordapp.net/attachments/788744790291644426/788770078522867742/FB_IMG_1608116357341.jpg?width=396&height=495"
  let img3 = "https://media.discordapp.net/attachments/761226988340903937/789485074739232818/GIF_.gif"
  let embed = new Discord.MessageEmbed()
    .setTitle("COVERT 구동영상")
    .setURL("https://streamable.com/nm28j7")
    .setAuthor("짱구", img2)
    .setThumbnail(img)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("**`링크 누를 시 COVERT 구동영상이 나옵니다.`**","**__데스매치 빡고영상입니다.__**\nhttps://streamable.com/nm28j7\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img3)
    .setColor("#1976D2")

    message.channel.send(embed)
} else if (message.content == "?ESP") {
  let img = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let img2 = "https://media.discordapp.net/attachments/788744790291644426/788770078522867742/FB_IMG_1608116357341.jpg?width=396&height=495"
  let img3 = "https://media.discordapp.net/attachments/761226988340903937/789540374205038652/sdsd.jpg?width=399&height=495"
  let embed = new Discord.MessageEmbed()
    .setTitle("COVERT Visuals UI 번역")
    .setURL("https://media.discordapp.net/attachments/761226988340903937/789540374205038652/sdsd.jpg?width=399&height=495")
    .setAuthor("짱구", img2)
    .setThumbnail(img)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("**`COVERT Visuals UI 부분`**","**__ESP UI번역 버전입니다.__**\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img3)
    .setColor("#a0ceff")

    message.channel.send(embed)
} else if (message.content == "?에임봇") {
  let img = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let img2 = "https://media.discordapp.net/attachments/788744790291644426/788770078522867742/FB_IMG_1608116357341.jpg?width=396&height=495"
  let img3 = "https://media.discordapp.net/attachments/761226988340903937/789540896424591440/dsds.jpg?width=398&height=495"
  let embed = new Discord.MessageEmbed()
    .setTitle("COVERT Aimbot UI 번역")
    .setURL("https://media.discordapp.net/attachments/761226988340903937/789540896424591440/dsds.jpg?width=398&height=495")
    .setAuthor("짱구", img2)
    .setThumbnail(img)
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("**`COVERT Aimbot UI 부분`**","**__에임봇 UI번역 버전입니다.__**\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setImage(img3)
    .setColor("#a0ceff")

    message.channel.send(embed)
} else if (message.content == "*COVERT 기능") {
  let img = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let embed = new Discord.MessageEmbed()
  .setTitle("[ COVERT ]")
  .setURL("https://www.naver.com")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("**`에임봇`**","**트리거**\n**반동제어**\n**범위 표시 ON/OFF**\n**스무스 조절**\n**범위 조절**\n**거리 조절**\n**샷 딜레이 조절**\n**에임 부위 선택**\n**에임 키 선택**\n**스냅라인 조준**\n**트랩와이어 조준**\n**스파이캠 조준**\n**붐봇 조준**\n**포탑 조준**\n**드론 조준**\n")
    .addField("**`ESP`**","**스켈레톤 ESP**\n**박스 ESP**\n**체력바 표시**\n**챔피언 이름 표시**\n**적까지의 거리 표시**\n**플레이어 닉네임 표시**\n**무기 표시**\n**적까지 선으로 표시**\n**스냅라인 표시**\n**트랩와이어 표시**\n**스파이캠 표시**\n**붐봇 표시**\n**포탑 표시**\n**드론 표시**\n**스파이크 표시**\n")
    .addField("**`MISC`**","**HWID 스푸퍼**\n**셋팅 저장/불러오기/공유**\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setThumbnail(img)
    .setColor("#0b0c0e")

    message.channel.send(embed)
} else if (message.content == "*COVERT 구매문의") {
  let img = "https://media.discordapp.net/attachments/761226988340903937/789485074739232818/GIF_.gif"
  let img2 = "https://images-ext-2.discordapp.net/external/3IYkyAF-0_UQ-oq8Em0B-BHtUjw_IDbjvSYoA1QYw0o/https/covertcheats.com/forums/images/logo.png"
  let embed = new Discord.MessageEmbed()
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .addField("**`구매문의`**","**__ADMIN or 티켓__**")
    .addField("**`가격`**","**__이벤트 가격 : 1일 16,000 KRW__**\n")
    .addField("**`구동영상`**","**__데스매치 빡고영상__**\nhttps://streamable.com/nm28j7\n")
    //.addBlankField()  < 해당 구문은 .addField('\u200b', '\u200b') 로 대체할 수 있습니다.
    .setThumbnail(img2)
    .setImage(img)
    .setColor("#0b0c0e")

    message.channel.send(embed)
} else if (message.content == "?초대코드2") {
  client.guilds.cache.array().forEach((x) => {
    x.channels.cache
      .find((x) => x.type == "text")
      .createInvite({ maxAge: 0 }) // maxAge: 0은 무한이라는 의미, maxAge부분을 지우면 24시간으로 설정됨
      .then((invite) => {
        message.channel.send(invite.url)
      })
      .catch((err) => {
        if (err.code == 50013) {
          message.channel.send(`**${x.channels.cache.find((x) => x.type == "text").guild.name}** 채널 권한이 없어 초대코드 발행 실패`)
        }
      })
  })
} else if (message.content == "?초대코드") {
  if (message.channel.type == "dm") {
    return message.reply("dm에서 사용할 수 없는 명령어 입니다.")
  }
  message.guild.channels.cache
    .get(message.channel.id)
    .createInvite({ maxAge: 0 }) // maxAge: 0은 무한이라는 의미, maxAge부분을 지우면 24시간으로 설정됨
    .then((invite) => {
      message.channel.send(invite.url)
    })
    .catch((err) => {
      if (err.code == 50013) {
        message.channel.send(`**${message.guild.channels.cache.get(message.channel.id).guild.name}** 채널 권한이 없어 초대코드 발행 실패`)
      }
    })
}else if (message.content.startsWith("!전체공지2")) {
  if (checkPermission(message)) return
  if (message.member != null) {
    // 채널에서 공지 쓸 때
    let contents = message.content.slice("!전체공지2".length)
    let embed = new Discord.MessageEmbed().setAuthor("NOTICE of 액션 BOT").setColor("#4ee75d").setFooter(`액션 BOT 🌠`).setTimestamp()

    embed.addField("공지: ", contents)

    message.member.guild.members.cache.array().forEach((x) => {
      if (x.user.bot) return
      x.user.send(embed)
    })

    return message.reply("공지를 전송했습니다.")
  } else {
    return message.reply("채널에서 실행해주세요.")
  }
}

  if (message.content.startsWith("!전체공지")) {
    if (checkPermission(message)) return
    if (message.member != null) {
      // 채널에서 공지 쓸 때
      let contents = message.content.slice("!전체공지".length)

      message.member.guild.members.cache.array().forEach((x) => {
        if (x.user.bot) return
        x.user.send(`<@${message.author.id}> ${contents}`)
      })

      return message.reply("공지를 전송했습니다.")
    } else {
      return message.reply("채널에서 실행해주세요.")
    }
  }else if (message.content.startsWith("!청소")) {
   if (message.channel.type == "dm") {
    return message.reply("dm에서 사용할 수 없는 명령어 입니다.")
  }

  if (message.channel.type != "dm" && checkPermission(message)) return

  var clearLine = message.content.slice("!청소 ".length)
  var isNum = !isNaN(clearLine)

  if (isNum && (clearLine <= 0 || 100 < clearLine)) {
    message.channel.send("1부터 100까지의 숫자만 입력해주세요.")
    return
  } else if (!isNum) {
    // c @나긋해 3
    if (message.content.split("<@").length == 2) {
      if (isNaN(message.content.split(" ")[2])) return

      var user = message.content.split(" ")[1].split("<@!")[1].split(">")[0]
      var count = parseInt(message.content.split(" ")[2]) + 1
      let _cnt = 0

      message.channel.messages.fetch().then((collected) => {
        collected.every((msg) => {
          if (msg.author.id == user) {
            msg.delete()
            ++_cnt
          }
          return !(_cnt == count)
        })
      })
    }
  } else {
    message.channel
      .bulkDelete(parseInt(clearLine) + 1)
      .then(() => {
        message.channel.send(`<@${message.author.id}> ${parseInt(clearLine)} 개의 메시지를 삭제했습니다. (이 메시지는 잠시 후 사라집니다.)`).then((msg) => msg.delete({ timeout: 3000 }))
      })
      .catch(console.error)
  }
 }
})

function checkPermission(message) {
  if (!message.member.hasPermission("MANAGE_MESSAGES")) {
    message.channel.send(`<@${message.author.id}> ` + "명령어를 수행할 관리자 권한을 소지하고 있지않습니다.")
    return true
  } else {
    return false
  }
}

function changeCommandStringLength(str, limitLen = 8) {
  let tmp = str
  limitLen -= tmp.length

  for (let i = 0; i < limitLen; i++) {
    tmp += " "
  }

  return tmp
}

client.login(token)
