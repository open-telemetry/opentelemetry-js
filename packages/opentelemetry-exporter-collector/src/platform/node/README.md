# Important

**Submodule is always pointing to certain revision number. So updating the master of the submodule repo will not have impact on your code.
Knowing this if you want to change the submodule to point to a different version (when for example proto has changed) here is how to do it:**

## Updating submodule to point to certain revision number

1. Make sure you are in the same folder as this instruction

2. Update your submodules by running this command

    ```shell script
    git submodule sync --recursive
    git submodule update --init --recursive
    ```

3. Find the SHA which you want to update to and copy it (the long one)
the latest sha when this guide was written is `b54688569186e0b862bf7462a983ccf2c50c0547`

4. Enter a submodule directory from this directory

    ```shell script
    cd protos
    ```

5. Updates files in the submodule tree to given commit:

    ```shell script
    git checkout -q <sha>
    ```

6. Return to the main directory:

    ```shell script
    cd ../
    ```

7. Please run `git status` you should see something like `Head detached at`. This is correct, go to next step

8. Now thing which is very important. You have to commit this to apply these changes

    ```shell script
    git commit -am "chore: updating submodule for opentelemetry-proto"
    ```

9. If you look now at git log you will notice that the folder `protos` has been changed and it will show what was the previous sha and what is current one.
