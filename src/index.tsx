import { Form, FormValue, ActionPanel, SubmitFormAction, showToast, ToastStyle } from "@raycast/api";
import { Client } from "@notionhq/client";
import { useState, useEffect } from "react";

const secretKey = "";
const databaseId = "04a36c38c7ff4c11b1762fd2ad1f0a36";

const notion = new Client({ auth: secretKey })

export default function Command() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function getOptions() {
      try {
        const response = await notion.databases.retrieve({ database_id: databaseId });
        console.log(response.properties.Tags.multi_select.options);
        setOptions(response.properties.Tags.multi_select.options);
      } catch (error) {
        console.error(error.body)
      }
    }

    getOptions()
  }, [])

  async function handleSubmit(values: Record<string, FormValue>) {
    // console.log(values);
    // showToast(ToastStyle.Success, "Submitted form", "See logs for submitted values");
    try {
      await addItem(values.title, values.tags, values.url)
      showToast(ToastStyle.Success, "Page added to Notion!", "See logs for submitted values");
    } catch (error: any) {
      showToast(ToastStyle.Failure, "An error occured", error.body);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <SubmitFormAction onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Page title" placeholder="Enter text" />
      <Form.TextField id="url" title="URL" placeholder="Enter text" />
      <Form.TagPicker id="tags" title="Tags" placeholder="Select some tags">
        { options.map(option => <Form.TagPicker.Item value={option.name} title={option.name} key={option.id} />)}
      </Form.TagPicker>
      <Form.Separator />
    </Form>
  );
}

async function addItem(content: FormValue, tags: FormValue, url: FormValue) {
  payload = {
    parent: { database_id: databaseId },
    properties: {
      title: { 
        title:[
          {
            "text": {
              "content": content
            }
          }
        ]
      },
      Tags: {
        type: "multi_select",
        multi_select: tags.map(option => ({ name: option }))
      },
    },
  }

  if (url) {
    payload.properties.URL = {
      type: "url",
      url: url
    }
  }
  
  await notion.pages.create(payload)
}
