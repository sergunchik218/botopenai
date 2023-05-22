import { Telegraf, session, Markup } from 'telegraf'
import config from 'config'
import { message} from 'telegraf/filters'
import { ogg } from './ogg.js'
import { openai } from './openai.js'
import { code } from 'telegraf/format'

console.log(config.get('TEST_ENV'))

const INITIAL_SESSION = {
  messages: [],
}

const bot = new Telegraf(config.get('Telegram_token'))

bot.use(session())

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply('🍀 Диалог обновлен 🍀')
} )

bot.command('start', async (ctx) => {
  const groupLink = 'https://t.me/BotOpenAo';
  const message = `💡💡💡Я - искусственный интеллект, созданный для упрощения решения задач и ответов на вопросы. Для начала работы вступите в группу <a href="${groupLink}">BotOpenAi</a>💡💡💡`;
  await ctx.replyWithHTML(message, Markup.inlineKeyboard([
    Markup.button.url('💡💡Вступить в группу💡💡', groupLink)
  ]));
})


bot.on('voice', async (ctx) => {
  const userId = String(ctx.message.from.id);
  console.log('User ID:', userId); // Отладочный вывод
  const groupMember = await ctx.telegram.getChatMember(GROUP_ID, userId);
  console.log('Group Member:', groupMember); // Отладочный вывод
  if (groupMember && groupMember.status === 'member') {
    try {
      await ctx.reply(code('⌛Ваш вопрос принят ожидайте ответа...⌛⌛⌛'));
      ctx.session ??= INITIAL_SESSION;
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      const oggPath = await ogg.create(link.href, userId);
      const mp3Path = await ogg.toMp3(oggPath, userId);
      const text = await openai.transcription(mp3Path);
      await ctx.reply(code(`Ваш запрос:✅ ${text}`));
      ctx.session.messages.push({ role: openai.roles.USER, content: text });
      const response = await openai.chat(ctx.session.messages);
      ctx.session.messages.push({
        role: openai.roles.ASSISTANT,
        content: response.content,
      });
      await ctx.reply(response.content);
    } catch (e) {
      console.log('Error while voice message', e.message);
    }
  } else if (groupMember.status === 'creator') {
    try {
      await ctx.reply(code('⌛Ваш вопрос принят ожидайте ответа...⌛⌛⌛'));
      ctx.session ??= INITIAL_SESSION;
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      const oggPath = await ogg.create(link.href, userId);
      const mp3Path = await ogg.toMp3(oggPath, userId);
      const text = await openai.transcription(mp3Path);
      await ctx.reply(code(`Ваш запрос:✅ ${text}`));
      ctx.session.messages.push({ role: openai.roles.USER, content: text });
      const response = await openai.chat(ctx.session.messages);
      ctx.session.messages.push({
        role: openai.roles.ASSISTANT,
        content: response.content,
      });
      await ctx.reply(response.content);
    } catch (e) {
      console.log('Error while voice message', e.message);
    }
  } else {
    const message = `💡💡💡Для начала работы вступите в группу <a href="${groupLink}">BotOpenAi</a>💡💡💡`;
    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('🍀💡Вступить в группу💡🍀', groupLink)
    ]);
    await ctx.replyWithHTML(message, keyboard);
  }
});

const GROUP_ID = '-1001761385833'
const groupLink = 'https://t.me/BotOpenAo'

bot.on(message('text'), async ctx => {
  const userId = String(ctx.message.from.id);
  console.log('User ID:', userId); // Отладочный вывод
  const groupMember = await ctx.telegram.getChatMember(GROUP_ID, userId);
  console.log('Group Member:', groupMember); // Отладочный вывод
  if (groupMember && groupMember.status === 'member') {
    try {
      await ctx.reply(code('⌛Ваш вопрос принят ожидайте ответа...'));
      ctx.session ??= INITIAL_SESSION;
      ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text });
      const response = await openai.chat(ctx.session.messages);
      ctx.session.messages.push({
        role: openai.roles.ASSISTANT,
        content: response.content,
      });
      await ctx.reply(response.content);
    } catch (e) {
      console.log('Error while voice message', e.message);
    }
  } else if (groupMember.status === 'creator') {
    try {
      await ctx.reply(code('⌛Ваш вопрос принят ожидайте ответа...⌛⌛⌛'));
      ctx.session ??= INITIAL_SESSION;
      ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text });
      const response = await openai.chat(ctx.session.messages);
      ctx.session.messages.push({
        role: openai.roles.ASSISTANT,
        content: response.content,
      });
      await ctx.reply(response.content);
    } catch (e) {
      console.log('Error while voice message', e.message);
    }
  } else {
    const message = `💡💡💡Для начала работы вступите в группу <a href="${groupLink}">BotOpenAi</a>💡💡💡`;
      const keyboard = Markup.inlineKeyboard([
        Markup.button.url('🍀💡Вступить в группу💡🍀', groupLink)
      ]);
      await ctx.replyWithHTML(message, keyboard);
    }
});

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))