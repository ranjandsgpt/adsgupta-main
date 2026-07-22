import { redirect } from 'next/navigation';

/** TalentOS login → central AdsGupta sign-in → tools hub */
export default function TalentOsLoginRedirect() {
  redirect('https://adsgupta.com/platform/usermanagement');
}
