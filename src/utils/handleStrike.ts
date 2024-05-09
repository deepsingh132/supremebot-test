import { ColorResolvable, Message, PermissionsBitField } from 'discord.js';
import { getMember } from './memberUtil';
import { checkAdminForMsg } from './checkAdmin';

import Member, { Members } from '../database/models/Member';
import { Colors } from '../configs/colors.json';
import { logAction } from './logHandler';
import { convertColor } from './convertColors';
import { Redis } from 'ioredis';
import { storeMemberListForLast24Hours } from './storeMemberList';

export const sendStrikeMessage = async (
  message: Message,
  memberData: Members,
  redis: Redis,
) => {
  const member = message.member;
  if (!member) return;

  // If the member has 1 strike, send a warning message
  if (memberData.strikes === 1) {
    message.channel.send(`${member}, that's a warning. Please mind the rules.`);
  } else if (memberData.strikes === 2) {
    // Send a last warning message
    message.channel.send(
      `${member}, that's your second warning. One more strike and you'll be kicked.`,
    );
  } else {
    // Kick the member
    await kickMember(message, redis);
  }
};

export const kickMember = async (message: Message, redis: Redis) => {
  const member = message.member;

  if (!member) return;

  // Kick the user and log the action
  member.kick('Repeated violations of rules').catch((err) => {
    console.error('Error kicking member:', err);
  });
  await logAction({
    bot: message.client,
    context: `${member} has been kicked for repeated violations.`,
    color: convertColor(Colors.BLURPLE),
  });
  // Clear the member's strikes
  await Member.findOneAndUpdate(
    { memberId: member.id },
    {
      $set: { strikes: 0 },
    },
    { new: true },
  );
  message.channel.send(`${member} has been kicked for repeated violations.`);

  // Store the kicked member in Redis
  await storeMemberListForLast24Hours(member, redis, 'kicked_members');
};

export const handleStrike = async (message: Message, redis: Redis) => {
  const member = message.member;
  if (!member) return;

  // Fetch the member from the database
  const memberData = await getMember(member.id);

  //check if the member is an admin
  // const isAdmin = await checkAdminForMsg(message);
  // if (isAdmin) {
  //   // an admin used a keyword, do nothing
  //   // probably log this to a channel or something
  //   return;
  // }

  // If the member is not in the database, add them
  if (!memberData) {
    const newMember = await Member.create({
      memberId: member.id,
      avatar: member.user.displayAvatarURL(),
      username: member.user.username,
      strikes: 1,
      warnings: 1,
    });
    if (newMember) {
      message.channel.send(
        `${member}, that's a warning. Please mind the rules.`,
      );
    }
    return;
  } else {
    // If the member is in the database, update the strikes and warnings
    const updatedMember = await Member.findOneAndUpdate(
      { memberId: member.id },
      {
        $inc: { strikes: 1, warnings: 1 },
      },
      { new: true },
    );
    if (updatedMember) {
      sendStrikeMessage(message, updatedMember, redis);
    }
  }
};
