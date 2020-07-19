export class InputChecker {
    
    public checkEmail(email: string) {
        const emailExp: RegExp = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(?:[a-zA-Z]{2}|aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel)$/
        return emailExp.test(email)
    }

    // Minimum eight characters, must include at least one upper case letter, one lower case letter, one numeric digit and maximum fifty characters
    public checkPassWord(password: string) {
        const passwordExp: RegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,50}$/
        return passwordExp.test(password)
    }

    public checkImageUrl(url: string) {
        const imageUrlExp: RegExp = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])+\.((jpg|jpeg|gif|png)(?!(\w|\W)))/
        return imageUrlExp.test(url)
    }
   
}
