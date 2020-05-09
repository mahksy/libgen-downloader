import { Interfaces } from '../interfaces.namespace';

import ascii from '../ascii';
import outputs from '../outputs';
import constants from '../constants';

export default abstract class Terminal {
    private static cursorIndex: number = 0;
    private static currentList: Interfaces.ListingObject[] = [];
    private static listedItemCount: number = 0;
    private static printedListingCount: number = 0;
    private static shiftOffset: number = 0;

    /*********************************************** */
    public static clear(): void {
        process.stdout.write(ascii.CLEARSCREEN)
        // readline.cursorTo(process.stdout, 0, 0);
        // readline.clearScreenDown(process.stdout);
    }

    public static clearCursorToEnd(): void {
        process.stdout.write(ascii.CLEARCURSORTOEND);
    }

    public static clearLine(): void {
        process.stdout.write(ascii.CLEARLINE);
    }

    private static clearList(): void {
        this.prevLineX(this.printedListingCount);
        this.clearCursorToEnd();
    }

    public static hideCursor(): void {
        process.stdout.write(ascii.HIDECURSOR);
    }

    public static showCursor(): void {
        process.stdout.write(ascii.SHOWCURSOR);
    }

    public static prevLine(): void {
        process.stdout.write(ascii.PREVLINE);
    }

    public static nextLine(): void {
        process.stdout.write(ascii.NEXTLINE);
    }

    public static prevLineX(x: number): void {
        process.stdout.write(ascii.PREVLINEX.replace('{x}', x.toString()));
    }

    public static nextLineX(x: number): void {
        process.stdout.write(ascii.NEXTLINEX.replace('{x}', x.toString()));
    }

    /*********************************************** */
    public static promptList(arr: Interfaces.ListingObject[], listedItemCount: number): void {
        this.cursorIndex = Math.floor(listedItemCount / 2);

        for (let i: number = 0; i < arr.length; i++) {
            if (arr[i].isCheckable) {
                if (!arr[i].submenu) {
                    arr[i].submenu = [];
                }

                arr[i].submenu?.push({
                    text: arr[i].checkBtnText || ' ',
                    value: constants.CHECKBTNVAL, 
                    isSubmenuListing: true,
                    isCheckable: false,
                    parentIndex: i
                });
            }

            if (arr[i].submenu) {
                arr[i].submenu?.push({
                    text: arr[i].submenuToggleBtnText || ' ',
                    value: constants.TOGGLECLOSEBTNVAL, 
                    isSubmenuListing: true,
                    isCheckable: false,
                    parentIndex: i
                });
            }
        }

        this.currentList = arr;
        this.listedItemCount = listedItemCount;

        this.renderList();
    }

    public static prevListing(): void {
        this.shiftOffset = (this.shiftOffset > 0) ? this.shiftOffset-=1 : this.currentList.length - 1;

        let pop: Interfaces.ListingObject | undefined = this.currentList.pop();

        if (pop) {
            this.currentList.unshift(pop)
        }

        this.renderList();
        console.log(this.shiftOffset);
    }

    public static nextListing(): void {
        this.shiftOffset = this.shiftOffset+=1 % this.currentList.length;

        let shift: Interfaces.ListingObject | undefined = this.currentList.shift();

        if  (shift) {
            this.currentList.push(shift);
        }

        this.renderList();
        console.log(this.shiftOffset);
    }

    private static renderList(): void {
        // if (this.printedListingCount != 0) {
        //     this.clearList();
        // }
        this.clear();
        this.printedListingCount = 0;

        let output: string = '';

        for (let i: number = 0; i < this.listedItemCount; i++) {
            let text: string = this.currentList[i].text;

            if (i == this.cursorIndex) {
                if (this.currentList[i].isSubmenuListing) {
                    output += outputs.SUBMENUHOVEREDOUTPUT.replace('{text}', text);
                } else if (this.currentList[i].isSubmenuOpen) {
                    output += outputs.TOGGLEDHOVEREDOUTPUT.replace('{text}', text);
                } else {
                    output += outputs.HOVEREDOUTPUT.replace('{text}', text);
                }
            } else if (this.currentList[i].isSubmenuListing){
                output += outputs.SUBMENUOUTPUT.replace('{text}', text);
            } else if (this.currentList[i].isSubmenuOpen) {
                output += outputs.TOGGLEDOUTPUT.replace('{text}', text);
            } else {
                output += outputs.STANDARTOUTPUT.replace('{text}', text);
            }

            this.printedListingCount++;
        }

        process.stdout.write(output);
    }

    public static getCurrentListing(): Interfaces.ListingObject | null {
        return this.currentList[this.cursorIndex] || null;
    }

    public static toggleSubmenu(): void {
        let currentListing: Interfaces.ListingObject = this.currentList[this.cursorIndex];
        
        if (currentListing.submenu || currentListing.parentIndex) {
            let targetIndex: number = currentListing.parentIndex || this.cursorIndex;
            let listingIndex: number = Math.abs(this.cursorIndex - this.shiftOffset) % this.listedItemCount;
            let targetListingItem: Interfaces.ListingObject = this.currentList[listingIndex];

            if (targetListingItem.submenu) {
                if (targetListingItem.isSubmenuOpen) {
                    this.currentList.splice(listingIndex + 1, targetListingItem.submenu.length);
                } else {
                    this.currentList.splice(listingIndex + 1, 0, ...targetListingItem.submenu); 
                }
            }

            this.currentList[listingIndex].isSubmenuOpen = !this.currentList[listingIndex].isSubmenuOpen;
            this.renderList();
            console.log(targetIndex, listingIndex, this.cursorIndex, this.shiftOffset);
        }

        //splice(this.cursorIndex + 1, submenu.length)
    }

    /*********************************************** */
    public static promptInput(promptHead: string): void {
        process.stdout.write(promptHead);
    }
}