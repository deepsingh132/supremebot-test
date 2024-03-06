import Member from "../database/models/Member";
import { Interaction, Message }  from "discord.js";

export const checkAdminForMsg = async (message: Message) => {

  const member = message.member;
  if (!member) return;

  if (member.roles.cache.some((role) => role.permissions.has('Administrator'))) {
    return true;
  }
  return false;
};

export const checkAdminForInteraction = async (interaction: Interaction) => {
  const member = interaction.guild;
  if (!member) return;

  if (member.members.cache.some((role) => role.permissions.has('Administrator'))){
    return true;
  }
  return false;
};